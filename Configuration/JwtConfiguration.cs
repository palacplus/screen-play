using System.ComponentModel.DataAnnotations;

namespace Climax.Configuration;

public class JwtConfiguration
{
    public static string ConfigSection => "Jwt";

    [Required]
    public string? Issuer { get; set; }

    [Required]
    public string? Audience { get; set; }

    [Required]
    public string? Key { get; set; }

    [Required]
    public int ExpirationMinutes { get; set; } = 60;
}
