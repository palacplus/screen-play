using System.ComponentModel.DataAnnotations;

namespace ScreenPlay.Server.Configuration;

#nullable enable
public class RadarrConfiguration
{
    public const string ConfigSection = "Radarr";

    [Required]
    public Uri? Uri { get; set; }

    [Required]
    public string? ApiKey { get; set; }

    public string? RootFolderPath { get; set; } = "/movies";
}
