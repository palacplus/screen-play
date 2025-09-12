using System.Net;
using System.Net.Http;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ScreenPlay.Server.Configuration;
using ScreenPlay.Server.Dtos;
using ScreenPlay.Server.Services;
using ScreenPlay.Server.Tests.Helpers;

namespace ScreenPlay.Tests.Services;

public class RadarrClientTests
{
    private readonly HttpClient _httpClient;
    private readonly RadarrClient _radarrClient;
    private readonly ILogger<RadarrClient> _loggerMock;
    private readonly RadarrConfiguration _radarrConfig;
    private readonly IOptions<RadarrConfiguration> _optionsMock;
    private readonly MockHttpMessageHandler _httpMessageHandlerMock;

    public RadarrClientTests()
    {
        _httpMessageHandlerMock = new MockHttpMessageHandler();
        _httpClient = new HttpClient(_httpMessageHandlerMock)
        {
            BaseAddress = new Uri("https://api.radarr.example.com/"),
        };

        _loggerMock = Substitute.For<ILogger<RadarrClient>>();
        _radarrConfig = new RadarrConfiguration
        {
            Uri = new Uri("https://api.radarr.example.com/"),
            ApiKey = "test-api-key",
        };

        _optionsMock = Substitute.For<IOptions<RadarrConfiguration>>();
        _optionsMock.Value.Returns(_radarrConfig);

        _radarrClient = new RadarrClient(_loggerMock, _httpClient, _optionsMock);
    }

    [Fact]
    public async Task QueueMovieAsync_ShouldReturnMovieDto_WhenRequestIsSuccessful()
    {
        // Arrange
        var QueueMovieRequest = new QueueMovieRequest(12345);

        var movieResponse = new MovieDto { Title = "Inception", TmdbId = 12345 };

        _httpMessageHandlerMock.SetupResponse(HttpStatusCode.OK, JsonSerializer.Serialize(movieResponse));

        // Act
        var result = await _radarrClient.QueueMovieAsync(QueueMovieRequest);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(movieResponse.Title);
        result.TmdbId.Should().Be(movieResponse.TmdbId);
    }

    [Fact]
    public async Task LookupMovieByImdbIdAsync_ShouldReturnMovieDto_WhenRequestIsSuccessful()
    {
        // Arrange
        var imdbId = "tt1375666";
        var movieResponse = new MovieDto { Title = "Inception", TmdbId = 12345 };

        _httpMessageHandlerMock.SetupResponse(HttpStatusCode.OK, JsonSerializer.Serialize(movieResponse));

        // Act
        var result = await _radarrClient.LookupMovieByImdbIdAsync(imdbId);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(movieResponse.Title);
        result.TmdbId.Should().Be(movieResponse.TmdbId);
    }

    [Fact]
    public async Task LookupMovieByImdbIdAsync_ShouldThrowException_WhenImdbIdIsNullOrEmpty()
    {
        // Arrange
        string imdbId = null;

        // Act
        Func<Task> act = async () => await _radarrClient.LookupMovieByImdbIdAsync(imdbId);

        // Assert
        await act.Should()
            .ThrowAsync<ArgumentException>()
            .WithMessage("IMDb ID cannot be null or empty. (Parameter 'imdbId')");
    }

    [Fact]
    public async Task QueueMovieAsync_ShouldThrowException_WhenPayloadIsNull()
    {
        // Arrange
        QueueMovieRequest payload = null;

        // Act
        Func<Task> act = async () => await _radarrClient.QueueMovieAsync(payload);

        // Assert
        await act.Should()
            .ThrowAsync<ArgumentNullException>()
            .WithMessage("Value cannot be null. (Parameter 'payload')");
    }

    [Fact]
    public async Task GetQueueActivityAsync_ShouldReturnQueueActivityDto_WhenRequestIsSuccessful()
    {
        // Arrange
        var queueActivityResponse = new QueueActivityDto
        {
            Page = 1,
            PageSize = 20,
            SortKey = "timeleft",
            TotalRecords = 2,
            Records = new List<QueueItemDto>
            {
                new QueueItemDto
                {
                    MovieId = 1,
                    Quality = new QualityDto
                    {
                        Quality = new QualityProfileDto
                        {
                            Id = 1,
                            Name = "HD-1080p",
                            Source = "bluray"
                        }
                    },
                    Added = DateTime.UtcNow.AddHours(-2),
                    Size = 5368709120, // 5GB
                    Status = "downloading",
                    Sizeleft = 1073741824, // 1GB
                    EstimatedCompletionTime = DateTime.UtcNow.AddHours(1),
                    Movie = new MovieDto { Title = "Inception", TmdbId = 12345 }
                },
                new QueueItemDto
                {
                    MovieId = 2,
                    Quality = new QualityDto
                    {
                        Quality = new QualityProfileDto
                        {
                            Id = 2,
                            Name = "HD-720p",
                            Source = "web"
                        }
                    },
                    Added = DateTime.UtcNow.AddHours(-1),
                    Size = 2147483648, // 2GB
                    Status = "queued",
                    Sizeleft = 2147483648, // 2GB
                    EstimatedCompletionTime = DateTime.UtcNow.AddHours(3),
                    Movie = new MovieDto { Title = "Interstellar", TmdbId = 67890 }
                }
            }
        };

        _httpMessageHandlerMock.SetupResponse(HttpStatusCode.OK, JsonSerializer.Serialize(queueActivityResponse));

        // Act
        var result = await _radarrClient.GetQueueActivityAsync();

        // Assert
        result.Should().NotBeNull();
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(20);
        result.SortKey.Should().Be("timeleft");
        result.TotalRecords.Should().Be(2);
        result.Records.Should().HaveCount(2);
        
        // Verify first record
        var firstRecord = result.Records[0];
        firstRecord.MovieId.Should().Be(1);
        firstRecord.Status.Should().Be("downloading");
        firstRecord.Movie.Title.Should().Be("Inception");
        firstRecord.Quality.Quality.Name.Should().Be("HD-1080p");
        
        // Verify second record
        var secondRecord = result.Records[1];
        secondRecord.MovieId.Should().Be(2);
        secondRecord.Status.Should().Be("queued");
        secondRecord.Movie.Title.Should().Be("Interstellar");
        secondRecord.Quality.Quality.Name.Should().Be("HD-720p");
    }
}
