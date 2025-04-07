using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StreamSelect.Dtos;

public class JwtTokenResponse
{
    [Required]
    [Display(Name = "Token")]
    [JsonPropertyName("token")]
    public required string Token { get; set; }
}
