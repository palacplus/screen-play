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
    Task<MovieDto> QueueMovieAsync(QueueMovieRequest payload);
    Task<MovieDto> LookupMovieByImdbIdAsync(string imdbId);
    Task<IEnumerable<MovieDto>> GetMoviesAsync();
    Task<MovieDto> GetMovieAsync(int tmdbId);
    Task DeleteMovieAsync(int id);
    Task<QueueActivityDto> GetQueueActivityAsync();
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

    public async Task<MovieDto> QueueMovieAsync(QueueMovieRequest payload)
    {
        if (payload == null)
            throw new ArgumentNullException(nameof(payload));

        payload.RootFolderPath = _config.RootFolderPath;

        var jsonPayload = JsonSerializer.Serialize(payload);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        return await _retryPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.PostAsync("/api/v3/movie", content);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "QueueMovieAsync failed with status code {StatusCode}: {ErrorContent}",
                    response.StatusCode,
                    errorContent
                );
                response.EnsureSuccessStatusCode();
            }

            var movie = await response.Content.ReadFromJsonAsync<MovieDto>();
            return movie;
        });
    }

    public async Task<MovieDto> LookupMovieByImdbIdAsync(string imdbId)
    {
        if (string.IsNullOrWhiteSpace(imdbId))
            throw new ArgumentException("IMDb ID cannot be null or empty.", nameof(imdbId));
        var requestUrl = $"/api/v3/movie/lookup/imdb?imdbId={Uri.EscapeDataString(imdbId)}";

        return await _retryPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.GetAsync(requestUrl);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "LookupMovieByImdbIdAsync failed with status code {StatusCode}: {ErrorContent}",
                    response.StatusCode,
                    errorContent
                );
                response.EnsureSuccessStatusCode();
            }

            var movie = await response.Content.ReadFromJsonAsync<MovieDto>();
            return movie;
        });
    }

    public async Task<IEnumerable<MovieDto>> GetMoviesAsync()
    {
        return await _retryPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.GetAsync("/api/v3/movie");
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "GetMoviesAsync failed with status code {StatusCode}: {ErrorContent}",
                    response.StatusCode,
                    errorContent
                );
                response.EnsureSuccessStatusCode();
            }

            return await response.Content.ReadFromJsonAsync<IEnumerable<MovieDto>>();
        });
    }

    public async Task<MovieDto> GetMovieAsync(int tmdbId)
    {
        var requestUrl = $"/api/v3/movie?tmdbid={tmdbId}";
        return await _retryPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.GetAsync(requestUrl);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "GetMovieAsync failed with status code {StatusCode}: {ErrorContent}",
                    response.StatusCode,
                    errorContent
                );
                response.EnsureSuccessStatusCode();
            }
            var movies = await response.Content.ReadFromJsonAsync<IEnumerable<MovieDto>>();
            return movies.FirstOrDefault(m => m.TmdbId == tmdbId);
        });
    }

    public async Task DeleteMovieAsync(int id)
    {
        var requestUrl = $"/api/v3/movie/{id}?deleteFiles=true";
        await _retryPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.DeleteAsync(requestUrl);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "DeleteMovieAsync failed with status code {StatusCode}: {ErrorContent}",
                    response.StatusCode,
                    errorContent
                );
            }
            response.EnsureSuccessStatusCode();
        });
    }

    public async Task<QueueActivityDto> GetQueueActivityAsync()
    {
        return await _retryPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.GetAsync("/api/v3/queue?includeMovie=true");
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "GetQueueActivityAsync failed with status code {StatusCode}: {ErrorContent}",
                    response.StatusCode,
                    errorContent
                );
                response.EnsureSuccessStatusCode();
            }
            return await response.Content.ReadFromJsonAsync<QueueActivityDto>();
        });
    }
}
