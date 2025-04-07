using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class ExternalLoginInfo
{
    [Required]
    [EmailAddress]
    [Display(Name = "Email")]
    [JsonPropertyName("email")]
    public string Email { get; set; }
}
