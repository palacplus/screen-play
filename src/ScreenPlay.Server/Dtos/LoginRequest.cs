using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Google.Apis.Auth;

namespace ScreenPlay.Server.Dtos;

public class LoginRequest
{
    [Required(ErrorMessage = "Please enter a valid email")]
    [EmailAddress]
    [Display(Name = "Email")]
    [JsonPropertyName("email")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Please enter a valid password")]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    [JsonPropertyName("password")]
    public string Password { get; set; }

    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    [JsonPropertyName("confirmPassword")]
    public string ConfirmPassword { get; set; }

    [Display(Name = "Remember me?")]
    public bool RememberMe { get; set; } = true;

    [JsonIgnore]
    public string Provider { get; set; } = string.Empty;

    public bool IsExternalLogin => string.IsNullOrEmpty(Password) && string.IsNullOrEmpty(ConfirmPassword) && !string.IsNullOrEmpty(Provider);

    public LoginRequest()
    {
        Email = string.Empty;
        Password = string.Empty;
        ConfirmPassword = string.Empty;
        RememberMe = true;
    }
}

public class ExternalLoginRequest : LoginRequest
{
    public new string Password { get; set; } = string.Empty;
    public new string ConfirmPassword { get; set; } = string.Empty;

    public ExternalLoginRequest(GoogleJsonWebSignature.Payload payload)
    {
        Provider = "Google";
        Email = payload.Email;
    }
}
