namespace ScreenPlay.Server.Dtos;

public class MovieResponse
{
    public string Title { get; set; }
    public string OriginalTitle { get; set; }
    public OriginalLanguage OriginalLanguage { get; set; }
    public int SecondaryYearSourceId { get; set; }
    public string SortTitle { get; set; }
    public long SizeOnDisk { get; set; }
    public string Status { get; set; }
    public string Overview { get; set; }
    public DateTime? InCinemas { get; set; }
    public DateTime? PhysicalRelease { get; set; }
    public DateTime? DigitalRelease { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public List<Image> Images { get; set; }
    public string Website { get; set; }
    public int Year { get; set; }
    public string YouTubeTrailerId { get; set; }
    public string Studio { get; set; }
    public string Path { get; set; }
    public int QualityProfileId { get; set; }
    public bool HasFile { get; set; }
    public int MovieFileId { get; set; }
    public bool Monitored { get; set; }
    public string MinimumAvailability { get; set; }
    public bool IsAvailable { get; set; }
    public string FolderName { get; set; }
    public int Runtime { get; set; }
    public string CleanTitle { get; set; }
    public string ImdbId { get; set; }
    public int TmdbId { get; set; }
    public string TitleSlug { get; set; }
    public string RootFolderPath { get; set; }
    public string Certification { get; set; }
    public List<string> Genres { get; set; }
    public List<string> Tags { get; set; }
    public DateTime Added { get; set; }
    public AddOptions AddOptions { get; set; }
    public Ratings Ratings { get; set; }
    public double Popularity { get; set; }
    public Statistics Statistics { get; set; }
    public int Id { get; set; }
}

public class OriginalLanguage
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class Image
{
    public string CoverType { get; set; }
    public string Url { get; set; }
    public string RemoteUrl { get; set; }
}

public class AddOptions
{
    public bool SearchForMovie { get; set; }
    public string AddMethod { get; set; }
    public bool IgnoreEpisodesWithFiles { get; set; }
    public bool IgnoreEpisodesWithoutFiles { get; set; }
    public string Monitor { get; set; }
}

public class Ratings
{
    public Rating Imdb { get; set; }
    public Rating Tmdb { get; set; }
    public Rating Metacritic { get; set; }
    public Rating RottenTomatoes { get; set; }
    public Rating Trakt { get; set; }
}

public class Rating
{
    public int Votes { get; set; }
    public double Value { get; set; }
    public string Type { get; set; }
}

public class Statistics
{
    public int MovieFileCount { get; set; }
    public long SizeOnDisk { get; set; }
    public List<string> ReleaseGroups { get; set; }
}
