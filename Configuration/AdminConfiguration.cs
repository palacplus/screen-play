using System.ComponentModel.DataAnnotations;

namespace Climax.Configuration;

public class AdminConfiguration
{
    public static string ConfigSection => "Admin";

    [Required]
    public string Email { get; set; } = "mpalacio123@gmail.com";
}
