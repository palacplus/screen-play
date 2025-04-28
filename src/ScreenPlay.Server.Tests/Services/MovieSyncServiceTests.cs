using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ScreenPlay.Server.Data;
using ScreenPlay.Server.Dtos;
using ScreenPlay.Server.Models;
using ScreenPlay.Server.Services;
using ScreenPlay.Server.Tests.Helpers;

namespace ScreenPlay.Server.Tests.Services;

public class MovieSyncServiceTests
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IRadarrClient _radarrClient;
    private readonly ILogger<MovieSyncService> _logger;
    private readonly AppDbContext _dbContext;

    public MovieSyncServiceTests()
    {
        _serviceProvider = Substitute.For<IServiceProvider>();
        var serviceScope = Substitute.For<IServiceScope>();
        serviceScope.ServiceProvider.Returns(_serviceProvider);
        var serviceScopeFactory = Substitute.For<IServiceScopeFactory>();
        serviceScopeFactory.CreateScope().Returns(serviceScope);
        _serviceProvider.GetService(typeof(IServiceScopeFactory)).Returns(serviceScopeFactory);

        _radarrClient = Substitute.For<IRadarrClient>();
        _logger = Substitute.For<ILogger<MovieSyncService>>();

        var dbContextOptions = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase("MovieDatabase").Options;
        _dbContext = new AppDbContext(dbContextOptions, Options.Create(new OperationalStoreOptions()));

        _serviceProvider.GetService(typeof(AppDbContext)).Returns(_dbContext);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldLogError_WhenExceptionOccurs()
    {
        // Arrange
        var cancellationToken = new CancellationTokenSource().Token;
        _radarrClient
            .GetMoviesAsync()
            .Returns(Task.FromException<IEnumerable<MovieDto>>(new Exception("Test exception")));

        var service = new MovieSyncService(_serviceProvider, _radarrClient, _logger, new HttpClient());

        // Act
        await service.StartAsync(cancellationToken);

        // Assert
        _logger
            .Received(1)
            .Log(
                LogLevel.Error,
                Arg.Any<EventId>(),
                Arg.Is<object>(o => o.ToString().Contains("Failed to fetch movies")),
                Arg.Any<Exception>(),
                Arg.Any<Func<object, Exception, string>>()
            );
    }

    [Fact]
    public async Task ExecuteAsync_ShouldAddMissingMovie_WhenSyncCompletes()
    {
        // Arrange
        var cancellationToken = new CancellationTokenSource().Token;

        var movieDto = new MovieDto
        {
            TmdbId = 1,
            ImdbId = "movie1",
            Title = "Movie 1",
            Images = new List<Image>
            {
                new Image { RemoteUrl = "http://example.com/image1.jpg", CoverType = "poster" },
            },
            Year = 2023,
            ReleaseDate = DateTime.UtcNow,
            Runtime = 120,
        };

        _radarrClient.GetMoviesAsync().Returns(new List<MovieDto> { movieDto });

        _dbContext.ChangeTracker.Clear();
        _dbContext.Movies.RemoveRange(_dbContext.Movies);
        await _dbContext.SaveChangesAsync();

        var service = new MovieSyncService(_serviceProvider, _radarrClient, _logger, new HttpClient());

        // Act
        await service.StartAsync(cancellationToken);

        // Assert
        _logger
            .DidNotReceive()
            .Log(
                LogLevel.Error,
                Arg.Any<EventId>(),
                Arg.Any<object>(),
                Arg.Any<Exception>(),
                Arg.Any<Func<object, Exception, string>>()
            );

        var storedMovie = await _dbContext.Movies.FirstOrDefaultAsync(t => t.TmdbId == 1);
        storedMovie.Should().NotBeNull();
        storedMovie.Title.Should().Be(movieDto.Title);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldUpdateExistingMovie_WhenSyncCompletes()
    {
        // Arrange
        var cancellationToken = new CancellationTokenSource().Token;

        var existingMovie = new Movie
        {
            TmdbId = 1,
            ImdbId = "movie1",
            Title = "Movie 1",
            IsDeleted = false,
            Images = new List<Image>
            {
                new Image { RemoteUrl = "http://example.com/image1.jpg", CoverType = "poster" },
            },
        };

        _radarrClient
            .GetMoviesAsync()
            .Returns(
                new List<MovieDto>
                {
                    new MovieDto { TmdbId = existingMovie.TmdbId, Title = existingMovie.Title },
                }
            );

        _dbContext.ChangeTracker.Clear();
        _dbContext.Movies.RemoveRange(_dbContext.Movies);
        _dbContext.Movies.Add(existingMovie);
        await _dbContext.SaveChangesAsync();

        var newMovieDto = new NewMovieDto
        {
            Title = "Different Title",
            Year = "2023",
            Rated = "PG-13",
            Released = "2023-01-01",
            Runtime = "120 min",
            Genre = "Action",
            Director = "Director 1",
            Writer = "Writer 1",
            Actors = "Actor 1, Actor 2",
            Plot = "Plot 1",
            Language = "English",
            Country = "USA",
        };
        var mockHttpHandler = new MockHttpMessageHandler();
        mockHttpHandler.SetupResponse(HttpStatusCode.OK, JsonSerializer.Serialize(newMovieDto));
        var httpClient = new HttpClient(mockHttpHandler);

        var service = new MovieSyncService(_serviceProvider, _radarrClient, _logger, httpClient);

        // Act
        await service.StartAsync(cancellationToken);

        // Assert
        _logger
            .DidNotReceive()
            .Log(
                LogLevel.Error,
                Arg.Any<EventId>(),
                Arg.Any<object>(),
                Arg.Any<Exception>(),
                Arg.Any<Func<object, Exception, string>>()
            );

        var storedMovie = await _dbContext.Movies.FirstOrDefaultAsync(t => t.TmdbId == 1);
        storedMovie.Should().NotBeNull();
        storedMovie.Title.Should().NotBe(newMovieDto.Title);
        storedMovie.Title.Should().Be(existingMovie.Title);
        storedMovie.Year.Should().Be(2023);
        storedMovie.Rated.Should().Be(newMovieDto.Rated);
        storedMovie.Genres[0].Should().Be(newMovieDto.Genre);
        storedMovie.Writers[0].Should().Be(newMovieDto.Writer);
        storedMovie.Actors.Should().Contain(newMovieDto.Actors.Split(", "));
        storedMovie.Language.Should().Be(newMovieDto.Language);
        storedMovie.Country.Should().Be(newMovieDto.Country);
        storedMovie.Description.Should().Be(newMovieDto.Plot);
        storedMovie.Runtime.Should().Be(120);
        storedMovie.ReleaseDate.Should().Be(DateTime.Parse(newMovieDto.Released));
        storedMovie.UpdatedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task ExecuteAsync_ShouldMarkIsDeleted_WhenUnwatched()
    {
        // Arrange
        var cancellationToken = new CancellationTokenSource().Token;

        var existingMovie = new Movie
        {
            TmdbId = 1,
            ImdbId = "movie1",
            Title = "Movie 1",
            IsDeleted = false,
            Images = new List<Image>
            {
                new Image { RemoteUrl = "http://example.com/image1.jpg", CoverType = "poster" },
            },
        };

        _radarrClient
            .GetMoviesAsync()
            .Returns(
                new List<MovieDto>
                {
                    new MovieDto { TmdbId = 2, Title = "Movie 2" },
                }
            );
        _dbContext.ChangeTracker.Clear();
        _dbContext.Movies.RemoveRange(_dbContext.Movies);
        _dbContext.Movies.Add(existingMovie);
        await _dbContext.SaveChangesAsync();

        var service = new MovieSyncService(_serviceProvider, _radarrClient, _logger, new HttpClient());

        // Act
        await service.StartAsync(cancellationToken);

        // Assert
        _logger
            .DidNotReceive()
            .Log(
                LogLevel.Error,
                Arg.Any<EventId>(),
                Arg.Any<object>(),
                Arg.Any<Exception>(),
                Arg.Any<Func<object, Exception, string>>()
            );

        var storedMovie = await _dbContext.Movies.FirstOrDefaultAsync(t => t.TmdbId == 1);
        storedMovie.Should().NotBeNull();
        storedMovie.Title.Should().Be(existingMovie.Title);
        storedMovie.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task ExecuteAsync_ShouldLogWarning_WhenNoMoviesFoundInRadarr()
    {
        // Arrange
        var cancellationToken = new CancellationTokenSource().Token;

        _radarrClient.GetMoviesAsync().Returns(Enumerable.Empty<MovieDto>());

        var service = new MovieSyncService(_serviceProvider, _radarrClient, _logger, new HttpClient());

        // Act
        await service.StartAsync(cancellationToken);

        // Assert
        _logger
            .Received(1)
            .Log(
                LogLevel.Warning,
                Arg.Any<EventId>(),
                Arg.Is<object>(o => o.ToString().Contains("No movies found in Radarr.")),
                null,
                Arg.Any<Func<object, Exception, string>>()
            );
    }
}
