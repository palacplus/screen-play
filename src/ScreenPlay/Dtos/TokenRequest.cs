using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ScreenPlay.Dtos;
/// <summary>
/// Request model for refreshing tokens.
/// </summary>
public class TokenRequest
{
    [Required(ErrorMessage = "Please provide a valid email")]
    [EmailAddress]
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [Required(ErrorMessage = "No refresh token provided")]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
    [Display(Name = "Refresh Token")]
    [JsonPropertyName("refreshToken")]
    public string? RefreshToken { get; set; }
}