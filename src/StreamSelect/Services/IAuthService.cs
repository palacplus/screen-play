using StreamSelect.Dtos;
using StreamSelect.Models;
using Microsoft.AspNetCore.Identity;

namespace StreamSelect.Services
{
    /// <summary>
    /// Registration Interface for add new user identities
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Registers an new Identity User using the user provided info
        /// </summary>
        /// <returns>Task<AppUser></returns>
        Task<AppUser> RegisterAsync(LoginInfo LoginInfo, string role);

        /// <summary>
        /// Processes a password login request using the user provided info
        /// </summary>
        /// <returns>Task<AuthResponse></returns>
        Task<AuthResponse> LoginAsync(LoginInfo LoginInfo);

        /// <summary>
        /// Processes a logout request
        /// </summary>
        /// <returns>Task</returns>
        Task LogoutAsync();

        /// <summary>
        /// Processes a password reset request using the user provided info
        /// </summary>
        /// <returns>Task<SignInResult></returns>
        Task<SignInResult> GetExternalInfoAsync();

        /// <summary>
        /// Refreshes the token using the user provided info
        /// </summary>
        /// <returns>Task<AuthResponse></returns>
        Task<AuthResponse> RefreshTokenAsync(TokenInfo tokenInfo);
    }
}
