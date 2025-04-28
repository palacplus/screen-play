namespace ScreenPlay.Server.Dtos;

public class QueueMovieRequest
{
    public QueueMovieRequest(int tmdbId)
    {
        TmdbId = tmdbId;
    }
    public int TmdbId { get; set; }
    public string RootFolderPath { get; set; } = "/movies";
    public int QualityProfileId { get; set; } = 1;
    public bool Monitored { get; set; } = true;
    public string MinimumAvailability { get; set; } = "announced";
    public SearchOptions AddOptions { get; set; } = new SearchOptions();
}

public class SearchOptions
{
    public bool SearchForMovie { get; set; } = true;
}
