using System.ComponentModel.DataAnnotations;
using System.Globalization;
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Dtos;

public class NewMovieDto
{
    [Required]
    public string Title { get; set; }

    [Required]
    [Range(1900, 2500, ErrorMessage = "Year must be between 1900 and 2100.")]
    public string? Year { get; set; }

    [Required]
    public string? Rated { get; set; }

    [Required]
    public string? Released { get; set; }

    [Required]
    [RegularExpression(@"^\d+ min$", ErrorMessage = "Runtime must be in the format 'X min'.")]
    public string? Runtime { get; set; }

    [Required]
    public string Genre { get; set; }

    [Required]
    public string? Director { get; set; }
    public string? Writer { get; set; }
    public string? Actors { get; set; }

    [Required]
    public string Plot { get; set; }
    public string? Language { get; set; }
    public string? Country { get; set; }
    public string? Awards { get; set; }

    [Required]
    public string Poster { get; set; }
    public List<AltRatingDto>? Ratings { get; set; }
    public string? Metascore { get; set; }
    public double? ImdbRating { get; set; }
    public string? ImdbVotes { get; set; }
    public string? ImdbID { get; set; }
    public string? BoxOffice { get; set; }
    public DateTime AddedDate { get; set; }

    public Movie ToMovie()
    {
        return new Movie
        {
            Title = this.Title,
            Year = int.TryParse(this.Year, out var year) ? year : 0,
            Rated = this.Rated,
            ReleaseDate = DateTime.TryParse(this.Released, out var releaseDate) ? releaseDate : null,
            Runtime = int.TryParse(this.Runtime?.Replace(" min", ""), out var runtime) ? runtime : 0,
            Genres = this.Genre?.Split(", ").ToList(),
            Director = this.Director,
            Writers = this.Writer?.Split(", ").ToList(),
            Actors = this.Actors?.Split(", ").ToList(),
            Description = this.Plot,
            Language = this.Language,
            Country = this.Country,
            Awards = this.Awards,
            Images = new List<Image>
            {
                new Image { CoverType = "poster", RemoteUrl = this.Poster },
            },
            Ratings = new List<Rating>
            {
                new Rating
                {
                    Source = "imdb",
                    Value = this.ImdbRating ?? 0.0,
                    Votes = long.Parse(this.ImdbVotes, NumberStyles.AllowThousands, CultureInfo.InvariantCulture),
                    Type = "user",
                },
                new Rating
                {
                    Source = "metacritic",
                    Value = double.TryParse(this.Metascore, out var metascore) ? metascore : 0.0,
                    Type = "user",
                },
            },
            ImdbId = this.ImdbID,
            BoxOffice = this.BoxOffice,
            Added = this.AddedDate,
        };
    }
}

public class AltRatingDto
{
    public string Source { get; set; }
    public string Value { get; set; }
}
