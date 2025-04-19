namespace ScreenPlay.Server.Models;

public class Movie
{
    public int Id { get; set; }
    public string? ImdbId { get; set; }
    public string? TmdbId { get; set; }
    public string? Title { get; set; }
    public int Year { get; set; }
    public string? Genre { get; set; }
    public string? Description { get; set; }
    public float Rating { get; set; }
    public string? FileName { get; set; }
}
