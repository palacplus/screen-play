using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Retry;
using ScreenPlay.Server.Configuration;
using ScreenPlay.Server.Dtos;

namespace ScreenPlay.Server.Services;

public interface IRadarrClient
{
    Task<MovieResponse> PostMovieAsync(AddMovieRequest payload);
    Task<MovieResponse> GetMovieByImdbIdAsync(string imdbId);
}

public class RadarrClient : IRadarrClient
{
    private readonly HttpClient _httpClient;
    private readonly AsyncRetryPolicy _retryPolicy;
    private readonly RadarrConfiguration _config;
    private readonly ILogger<RadarrClient> _logger;

    public RadarrClient(ILogger<RadarrClient> logger, HttpClient httpClient, IOptions<RadarrConfiguration> options)
    {
        _logger = logger;
        _config = options?.Value ?? throw new ArgumentNullException(nameof(options));
        _httpClient = httpClient;
        _httpClient.BaseAddress = _config.Uri;
        _httpClient.DefaultRequestHeaders.Add("X-Api-Key", _config.ApiKey);
        _retryPolicy = Policy
            .Handle<HttpRequestException>()
            .Or<TaskCanceledException>()
            .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
    }

    public async Task<MovieResponse> PostMovieAsync(AddMovieRequest payload)
    {
        if (payload == null) throw new ArgumentNullException(nameof(payload));

        var jsonPayload = JsonSerializer.Serialize(payload);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        return await _retryPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.PostAsync("/api/v3/movie", content);
            response.EnsureSuccessStatusCode();

            response.EnsureSuccessStatusCode();
            var movie = await response.Content.ReadFromJsonAsync<MovieResponse>();
            return movie;
        });
    }

    public async Task<MovieResponse> GetMovieByImdbIdAsync(string imdbId)
    {
        if (string.IsNullOrWhiteSpace(imdbId))
            throw new ArgumentException("IMDb ID cannot be null or empty.", nameof(imdbId));
        var requestUrl = $"/api/v3/movie/lookup/imdb?imdbId={Uri.EscapeDataString(imdbId)}";
        _logger.LogInformation("Requesting movie {requestUrl}", requestUrl);

        return await _retryPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.GetAsync(requestUrl);

            response.EnsureSuccessStatusCode();
            var movie = await response.Content.ReadFromJsonAsync<MovieResponse>();

            return movie;
        });
    }
}
