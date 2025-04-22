using Microsoft.Extensions.Options;
using ScreenPlay.Server.Configuration;
using ScreenPlay.Server.Dtos;
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Services;

public static class AdminUserInitializer
{
    public static async Task CreateAdminUser(IAuthService authService, AdminCredentials config)
    {
        var user = await authService.GetUserByEmailAsync(config.Email);
        if (user == null)
        {
            var login = new LoginRequest { Email = config.Email, Password = config.Password };
            var result = await authService.RegisterAsync(login, AppRole.Admin);
            if (result.ErrorMessage != null)
            {
                throw new Exception($"Failed to create admin user: {result.ErrorMessage}");
            }
        }
    }
}
