using System.ComponentModel.DataAnnotations;

namespace Climax.Dtos;

public class UserInfo
{
    /// <summary>
    ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    [Required(ErrorMessage = "Please enter a valid email")]
    [EmailAddress]
    public string Email { get; set; }

    /// <summary>
    ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    [Required(ErrorMessage = "Please enter a valid password")]
    [DataType(DataType.Password)]
    public string Password { get; set; }

    /// <summary>
    ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    [Display(Name = "Remember me?")]
    public bool RememberMe { get; set; }
}
