using System.ComponentModel.DataAnnotations;

namespace ScreenPlay.Server.Models;

public class TokenInfo
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(30)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string AccessToken { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string RefreshToken { get; set; } = string.Empty;

    [Required]
    public DateTime ExpiredAt { get; set; }
}