using System.ComponentModel.DataAnnotations;

namespace StreamSelect.Configuration;

public class GoogleAuthConfiguration
{
    public static string ConfigSection => "Authentication:Google";

    [Required]
    public string ClientId { get; set; }

    [Required]
    public string ClientSecret { get; set; }
}
