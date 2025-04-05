using System.ComponentModel.DataAnnotations;

namespace Climax.Dtos;

public class UserInfo
{
    [Required(ErrorMessage = "Please enter a valid email")]
    [EmailAddress]
    public string Email { get; set; }

    [Required(ErrorMessage = "Please enter a valid password")]
    [DataType(DataType.Password)]
    public string Password { get; set; }

    [Display(Name = "Remember me?")]
    public bool RememberMe { get; set; }
}
