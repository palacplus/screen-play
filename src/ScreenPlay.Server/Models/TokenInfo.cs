using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScreenPlay.Server.Models;

public class TokenInfo
{
    [Key]
    public int Id { get; set; }

    [Required]
    [ForeignKey(nameof(AppUser))]
    public string UserId { get; set; }
    public AppUser AppUser { get; set; }

    [Required]
    public string AccessToken { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string RefreshToken { get; set; } = string.Empty;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime ExpiredAt { get; set; }

    [Timestamp]
    public uint Version { get; set; }
}
