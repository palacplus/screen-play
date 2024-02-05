using Climax.Dtos;
using Climax.Models;
using Microsoft.AspNetCore.Identity;

namespace Climax.Services
{
    /// <summary>
    /// Registration Interface for add new user identities
    /// </summary>
    public interface IAccountManagementService
    {
        /// <summary>
        /// Registers an new Identity User using the user provided info
        /// </summary>
        /// <returns>ModelState</returns>
        Task<AppUser> RegisterUserAsync(NewUserInfo userInfo);

        /// <summary>
        /// Processes a password login request using the user provided info
        /// </summary>
        Task<AppUser?> LoginUserAsync(UserInfo userInfo);

        /// <summary>
        /// Processes a logout request
        /// </summary>
        Task LogoutUserAsync();
        Task<SignInResult> GetExternalInfoAsync();
    }
}
