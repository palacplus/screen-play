using System.ComponentModel.DataAnnotations;

namespace Climax.Configuration;

public class GoogleAuthKeys
{
    public static string ConfigSection => "Authentication:Google";

    [Required]
    public string ClientId { get; set; }

    [Required]
    public string ClientSecret { get; set; }
}
