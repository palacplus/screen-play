using System.ComponentModel.DataAnnotations;

namespace ScreenPlay.Server.Configuration;

public class AdminConfiguration
{
    public const string ConfigSection = "Admin";

    [Required]
    public string Email { get; set; } = "mpalacio123@gmail.com";
}
