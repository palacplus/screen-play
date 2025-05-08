using Microsoft.AspNetCore.Identity;
using ScreenPlay.Server.Dtos;
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Services
{
    /// <summary>
    /// Registration Interface for add new user identities
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Gets the user by email
        /// </summary>
        /// <returns>Task<AppUser></returns>
        /// <param name="email">Email of the user</param>
        Task<AppUser?> GetUserByEmailAsync(string email);

        /// <summary>
        /// Gets all users
        /// </summary>
        /// <returns>Task<IEnumerable<AppUser>></returns>
        Task<IEnumerable<AppUser>> GetAllUsersAsync();

        /// <summary>
        /// Deletes the user by email
        /// </summary>
        /// <returns>Task<bool></returns>
        /// <param name="email">Email of the user</param>
        Task<bool> DeleteUserAsync(string email);

        /// <summary>
        /// Registers an new Identity User using the user provided info
        /// </summary>
        /// <returns>Task<AppUser></returns>
        Task<AuthResponse> RegisterAsync(LoginRequest request, string role);

        /// <summary>
        /// Processes a password login request using the user provided info
        /// </summary>
        /// <returns>Task<AuthResponse></returns>
        Task<AuthResponse> LoginAsync(LoginRequest request);

        /// <summary>
        /// Processes a logout request
        /// </summary>
        /// <returns>Task</returns>
        Task LogoutAsync(string email);

        /// <summary>
        /// Refreshes the token using the user provided info
        /// </summary>
        /// <returns>Task<AuthResponse></returns>
        Task<AuthResponse> RefreshTokenAsync(TokenInfo tokenInfo);
    }
}
