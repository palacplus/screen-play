using System.ComponentModel.DataAnnotations;

namespace ScreenPlay.Server.Configuration;

public class GoogleAuthConfiguration
{
    public const string ConfigSection = "Authentication:Google";

    [Required]
    public string? ClientId { get; set; }

    [Required]
    public string? ClientSecret { get; set; }
}
