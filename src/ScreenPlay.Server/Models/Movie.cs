using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ScreenPlay.Server.Models;

public class Movie
{
    private bool _isComplete;

    public int Id { get; set; }
    public string ImdbId { get; set; }
    public int TmdbId { get; set; }
    public string Title { get; set; }
    public int Year { get; set; }
    public string Description { get; set; }
    public string Rated { get; set; }
    public string FileName { get; set; }
    public string OriginalTitle { get; set; }
    public string Language { get; set; }
    public string SortTitle { get; set; }
    public long SizeOnDisk { get; set; }
    public string Status { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public List<Image> Images { get; set; }
    public string YouTubeTrailerId { get; set; }
    public string Studio { get; set; }
    public string Path { get; set; }
    public int QualityProfileId { get; set; }
    public bool HasFile { get; set; }
    public bool Monitored { get; set; }
    public string MinimumAvailability { get; set; }
    public bool IsAvailable { get; set; }
    public string FolderName { get; set; }
    public int Runtime { get; set; }
    public string CleanTitle { get; set; }
    public string TitleSlug { get; set; }
    public string RootFolderPath { get; set; }
    public List<string> Genres { get; set; }
    public List<string> Tags { get; set; }
    public DateTime Added { get; set; }
    public List<Rating> Ratings { get; set; }
    public double Popularity { get; set; }
    public string Director { get; set; }
    public List<string> Actors { get; set; }
    public List<string> Writers { get; set; }
    public string Country { get; set; }
    public string Awards { get; set; }
    public string BoxOffice { get; set; }

    [JsonIgnore]
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedDate { get; set; }
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public bool IsComplete
    {
        get => _isComplete;
        private set => _isComplete = value;
    }

    public void Update()
    {
        IsComplete =
            !string.IsNullOrWhiteSpace(Title)
            && Genres != null
            && Genres.Any()
            && !string.IsNullOrWhiteSpace(Description)
            && ReleaseDate.HasValue
            && Images != null
            && Images.Any()
            && Ratings != null
            && Ratings.Any()
            && !string.IsNullOrWhiteSpace(Rated)
            && !string.IsNullOrWhiteSpace(Director)
            && Actors != null
            && Actors.Any()
            && Writers != null
            && Writers.Any()
            && !string.IsNullOrWhiteSpace(Language)
            && !string.IsNullOrWhiteSpace(Country)
            && !string.IsNullOrWhiteSpace(BoxOffice);
        UpdatedDate = DateTime.UtcNow;
    }
}

public class Image
{
    public int Id { get; set; }

    [ForeignKey("Movie")]
    public int MovieId { get; set; }
    public string CoverType { get; set; }
    public string RemoteUrl { get; set; }
}

public class Rating
{
    public int Id { get; set; }

    [ForeignKey("Movie")]
    public int MovieId { get; set; }
    public string Source { get; set; }
    public long Votes { get; set; }
    public double Value { get; set; }
    public string Type { get; set; }
}
