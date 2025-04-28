using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class GoogleCallbackRequest
{
    [Required]
    [JsonPropertyName("credential")]
    public string Credential { get; set; } = string.Empty;
}