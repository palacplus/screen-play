namespace ScreenPlay.Server.Dtos;

public class AddMovieRequest
{
    public AddMovieRequest(int tmdbId)
    {
        TmdbId = tmdbId;
    }
    public int TmdbId { get; set; }
    public string RootFolderPath { get; set; } = "/movies";
    public int QualityProfileId { get; set; } = 1;
    public bool Monitored { get; set; } = true;
    public string MinimumAvailability { get; set; } = "announced";
    public AddMovieOptions AddOptions { get; set; } = new AddMovieOptions();
}

public class AddMovieOptions
{
    public bool SearchForMovie { get; set; } = true;
}
