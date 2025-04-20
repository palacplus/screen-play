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
    public async Task SearchMovieAsync_ShouldReturnMovieDto_WhenRequestIsSuccessful()
    {
        // Arrange
        var SearchMovieRequest = new SearchMovieRequest(12345);

        var movieResponse = new MovieDto { Title = "Inception", TmdbId = 12345 };

        _httpMessageHandlerMock.SetupResponse(HttpStatusCode.OK, JsonSerializer.Serialize(movieResponse));

        // Act
        var result = await _radarrClient.SearchMovieAsync(SearchMovieRequest);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(movieResponse.Title);
        result.TmdbId.Should().Be(movieResponse.TmdbId);
    }

    [Fact]
    public async Task GetMovieByImdbIdAsync_ShouldReturnMovieDto_WhenRequestIsSuccessful()
    {
        // Arrange
        var imdbId = "tt1375666";
        var movieResponse = new MovieDto { Title = "Inception", TmdbId = 12345 };

        _httpMessageHandlerMock.SetupResponse(HttpStatusCode.OK, JsonSerializer.Serialize(movieResponse));

        // Act
        var result = await _radarrClient.GetMovieByImdbIdAsync(imdbId);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(movieResponse.Title);
        result.TmdbId.Should().Be(movieResponse.TmdbId);
    }

    [Fact]
    public async Task GetMovieByImdbIdAsync_ShouldThrowException_WhenImdbIdIsNullOrEmpty()
    {
        // Arrange
        string imdbId = null;

        // Act
        Func<Task> act = async () => await _radarrClient.GetMovieByImdbIdAsync(imdbId);

        // Assert
        await act.Should()
            .ThrowAsync<ArgumentException>()
            .WithMessage("IMDb ID cannot be null or empty. (Parameter 'imdbId')");
    }

    [Fact]
    public async Task SearchMovieAsync_ShouldThrowException_WhenPayloadIsNull()
    {
        // Arrange
        SearchMovieRequest payload = null;

        // Act
        Func<Task> act = async () => await _radarrClient.SearchMovieAsync(payload);

        // Assert
        await act.Should()
            .ThrowAsync<ArgumentNullException>()
            .WithMessage("Value cannot be null. (Parameter 'payload')");
    }
}
