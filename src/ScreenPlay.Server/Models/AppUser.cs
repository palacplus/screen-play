using Microsoft.AspNetCore.Identity;

namespace ScreenPlay.Server.Models;

public class AppUser : IdentityUser
{
    public string Role { get; set; } = string.Empty;
}

public static class AppRole
{
    public const string Admin = "Admin";
    public const string User = "User";
}
