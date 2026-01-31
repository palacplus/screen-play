using System.ComponentModel.DataAnnotations;
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Dtos;

public class MovieDto
{
    [Required]
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

    [Required]
    public DateTime? ReleaseDate { get; set; }

    [Required]
    public List<Image> Images { get; set; }
    public string Website { get; set; }

    [Required]
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

    [Required]
    public int Runtime { get; set; }
    public string CleanTitle { get; set; }

    [Required]
    public string ImdbId { get; set; }

    [Required]
    public int TmdbId { get; set; }
    public string TitleSlug { get; set; }
    public string RootFolderPath { get; set; }
    public string Certification { get; set; }
    public List<string> Genres { get; set; }
    public DateTime Added { get; set; }
    public AddOptions AddOptions { get; set; }
    public RatingsDto Ratings { get; set; }
    public double Popularity { get; set; }
    public Statistics Statistics { get; set; }
    public int Id { get; set; }

    public Movie ToMovie()
    {
        return new Movie
        {
            Title = this.Title,
            OriginalTitle = this.OriginalTitle,
            Language = this.OriginalLanguage?.Name,
            SortTitle = this.SortTitle,
            SizeOnDisk = this.SizeOnDisk,
            Status = this.Status,
            Description = this.Overview,
            ReleaseDate = this.ReleaseDate,
            YouTubeTrailerId = this.YouTubeTrailerId,
            Studio = this.Studio,
            Path = this.Path,
            QualityProfileId = this.QualityProfileId,
            HasFile = this.HasFile,
            Monitored = this.Monitored,
            MinimumAvailability = this.MinimumAvailability,
            IsAvailable = this.IsAvailable,
            FolderName = this.FolderName,
            Runtime = this.Runtime,
            CleanTitle = this.CleanTitle,
            ImdbId = this.ImdbId,
            TmdbId = this.TmdbId,
            TitleSlug = this.TitleSlug,
            RootFolderPath = this.RootFolderPath,
            Rated = this.Certification,
            Genres = this.Genres ?? new List<string>(),
            Tags = new List<string>(),
            Added = this.Added,
            Ratings = new List<Rating> {
                new Rating
                {
                    Source = "imdb",
                    Value = this.Ratings?.Imdb?.Value ?? 0.0,
                    Votes = this.Ratings?.Imdb?.Votes ?? 0,
                    Type = "user",
                },
                new Rating
                {
                    Source = "tmdb",
                    Value = this.Ratings?.Tmdb?.Value ?? 0.0,
                    Votes = this.Ratings?.Tmdb?.Votes ?? 0,
                    Type = "user",
                },
                new Rating
                {
                    Source = "metacritic",
                    Value = this.Ratings?.mMtacritic?.Value ?? 0.0,
                    Votes = this.Ratings?.mMtacritic?.Votes ?? 0,
                    Type = "user",
                },
                new Rating
                {
                    Source = "rotten_tomatoes",
                    Value = this.Ratings?.RottenTomatoes?.Value ?? 0.0,
                    Votes = this.Ratings?.RottenTomatoes?.Votes ?? 0,
                    Type = "user",
                },
            },
            Popularity = this.Popularity,
            Images = this.Images ?? new List<Image>(),
        };
    }

    public List<string> Validate()
    {
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(this);

        if (!Validator.TryValidateObject(this, validationContext, validationResults, true))
        {
            return validationResults.ConvertAll(vr => vr.ErrorMessage);
        }

        return new List<string>();
    }
}

public class OriginalLanguage
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class AddOptions
{
    public bool SearchForMovie { get; set; }
    public string AddMethod { get; set; }
    public bool IgnoreEpisodesWithFiles { get; set; }
    public bool IgnoreEpisodesWithoutFiles { get; set; }
    public string Monitor { get; set; }
}

public class Statistics
{
    public int MovieFileCount { get; set; }
    public long SizeOnDisk { get; set; }
    public List<string> ReleaseGroups { get; set; }
}

public class RatingsDto
{
    public Rating Imdb { get; set; }
    public Rating Tmdb { get; set; }
    public Rating mMtacritic { get; set; }
    public Rating RottenTomatoes { get; set; }
}

public class RatingDto
{
    public double Value { get; set; }
    public long Votes { get; set; }
    public string Type { get; set; }
}
