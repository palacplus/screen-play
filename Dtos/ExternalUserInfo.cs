using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class ExternalUserInfo
{
    [Required]
    [EmailAddress]
    [Display(Name = "Email")]
    [JsonPropertyName("email")]
    public string Email { get; set; }
}
