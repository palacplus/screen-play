using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using ScreenPlay.Server.Data;
using ScreenPlay.Server.Dtos;
using ScreenPlay.Server.Extensions;
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Services;

public class MovieSyncService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IRadarrClient _radarrClient;
    private readonly ILogger<MovieSyncService> _logger;
    private readonly HttpClient _httpClient;
    private readonly SyncTrigger _syncTrigger;

    public MovieSyncService(
        IServiceProvider serviceProvider,
        IRadarrClient radarrClient,
        ILogger<MovieSyncService> logger,
        HttpClient httpClient,
        SyncTrigger syncTrigger
    )
    {
        _serviceProvider = serviceProvider;
        _radarrClient = radarrClient;
        _logger = logger;
        _httpClient = httpClient;
        _syncTrigger = syncTrigger;
        _httpClient.BaseAddress = new Uri("https://www.omdbapi.com");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MovieSyncService is starting.");
        var periodicTimer = new PeriodicTimer(TimeSpan.FromMinutes(10));

        while (!stoppingToken.IsCancellationRequested)
        {
            // Wait for either the timer to tick or a sync request to be triggered
            await Task.WhenAny(
                periodicTimer.WaitForNextTickAsync(stoppingToken).AsTask(),
                _syncTrigger.WaitForSyncRequestAsync()
            );
            
            try
            {
                await SyncMoviesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while syncing movies.");
            }
        }

        _logger.LogInformation("MovieSyncService is stopping.");
    }

    public async Task SyncMoviesAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting movie database sync...");

        var radarrMovies = await FetchRadarrMoviesAsync();
        if (!radarrMovies.Any())
        {
            _logger.LogWarning("No movies found in Radarr.");
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var dbMovies = await FetchDatabaseMoviesAsync(dbContext, cancellationToken);

        AddNewMoviesAsync(dbContext, radarrMovies, dbMovies);
        MarkRemovedMovies(dbContext, radarrMovies, dbMovies);
        await UpdateIncompleteMoviesAsync(dbContext, dbMovies, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Movie database sync completed.");
    }

    private async Task<IEnumerable<MovieDto>> FetchRadarrMoviesAsync()
    {
        try
        {
            var radarrMovies = await _radarrClient.GetMoviesAsync();
            return radarrMovies ?? Enumerable.Empty<MovieDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch movies from Radarr.");
            return Enumerable.Empty<MovieDto>();
        }
    }

    private async Task<List<Movie>> FetchDatabaseMoviesAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        return await dbContext.Movies.Where(m => !m.IsDeleted).ToListAsync(cancellationToken);
    }

    private void AddNewMoviesAsync(AppDbContext dbContext, IEnumerable<MovieDto> radarrMovies, List<Movie> dbMovies)
    {
        var existingTmdbIds = dbMovies.Select(m => m.TmdbId).ToHashSet();

        foreach (var radarrMovie in radarrMovies)
        {
            if (!existingTmdbIds.Contains(radarrMovie.TmdbId))
            {
                var movie = radarrMovie.ToMovie();
                dbContext.Movies.Add(movie);
                _logger.LogInformation("Added new movie: {Title} (TMDb ID: {TmdbId})", movie.Title, movie.TmdbId);
            }
        }
    }

    private void MarkRemovedMovies(AppDbContext dbContext, IEnumerable<MovieDto> radarrMovies, List<Movie> dbMovies)
    {
        var radarrTmdbIds = radarrMovies.Select(m => m.TmdbId).ToHashSet();
        var removedMovies = dbMovies.Where(m => !radarrTmdbIds.Contains(m.TmdbId)).ToList();

        foreach (var movie in removedMovies)
        {
            movie.IsDeleted = true;
            movie.DeletedDate = DateTime.UtcNow;
            _logger.LogInformation("Marking movie as deleted: {Title} (TMDb ID: {TmdbId})", movie.Title, movie.TmdbId);
        }

        dbContext.Movies.UpdateRange(removedMovies);
    }

    private async Task UpdateIncompleteMoviesAsync(
        AppDbContext dbContext,
        List<Movie> dbMovies,
        CancellationToken cancellationToken
    )
    {
        var incompleteMovies = dbMovies.Where(m => !m.IsComplete).ToList();

        _logger.LogInformation("Found {Count} incomplete movies to update.", incompleteMovies.Count);

        foreach (var movie in incompleteMovies)
        {
            try
            {
                var updatedMovie = await FetchMovieDetailsFromOmdbAsync(movie.ImdbId, cancellationToken);
                if (updatedMovie != null)
                {
                    movie.EnrichWith(updatedMovie.ToMovie());
                    movie.Update();
                    _logger.LogDebug("Updated movie: {Title} (IMDb ID: {ImdbId})", movie.Title, movie.ImdbId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update movie: {ImdbId}", movie.ImdbId);
            }
        }

        dbContext.Movies.UpdateRange(incompleteMovies);
    }

    private async Task<NewMovieDto?> FetchMovieDetailsFromOmdbAsync(string imdbId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(imdbId))
        {
            _logger.LogWarning("Invalid IMDb ID: {ImdbId}", imdbId);
            return null;
        }

        var queryParams = new Dictionary<string, string> { { "i", imdbId }, { "apikey", "e11f806f" } };
        var requestUrl = QueryHelpers.AddQueryString(_httpClient.BaseAddress.ToString(), queryParams);

        var response = await _httpClient.GetAsync(requestUrl, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Failed to fetch data from OMDB for IMDb ID: {ImdbId}", imdbId);
            return null;
        }

        return await response.Content.ReadFromJsonAsync<NewMovieDto>(cancellationToken);
    }
}
