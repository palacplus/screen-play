using System.ComponentModel.DataAnnotations;

namespace ScreenPlay.Server.Configuration;

public class JwtConfiguration
{
    public const string ConfigSection = "Authentication:Jwt";

    [Required]
    public string? Issuer { get; set; }

    [Required]
    public string? Audience { get; set; }

    [Required]
    public string? Key { get; set; }

    [Required]
    public int ExpirationMinutes { get; set; } = 60;
}
