using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.CodeAnalysis.Emit;

namespace Climax.Dtos;

public class NewUserInfo
{
    [Required]
    [EmailAddress]
    [Display(Name = "Email")]
    [JsonPropertyName("email")]
    public string Email { get; set; }

    /// <summary>
    ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    [JsonPropertyName("password")]
    public string Password { get; set; }

    /// <summary>
    ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    [JsonPropertyName("confirmPassword")]
    public string ConfirmPassword { get; set; }

    public NewUserInfo(JwtSecurityToken jwtToken)
    {
        var emailClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "email");
        if (emailClaim != null)
        {
            Email = emailClaim.Value;
            Password = "insecure";
            ConfirmPassword = "insecure";
        }
        else
        {
            throw new Exception();
        }
    }
}
