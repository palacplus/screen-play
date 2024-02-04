using Climax.Dtos;
using Climax.Models;
using Microsoft.AspNetCore.Identity;

namespace Climax.Services
{
    /// <summary>
    /// Registration Interface for add new user identities
    /// </summary>
    public interface IRegistrationService
    {
        /// <summary>
        /// Registers an new Identity User using the user provided info
        /// </summary>
        /// <returns>ModelState</returns>
        Task<AppUser> RegisterUserAsync(NewUserInfo userInfo, string returnUrl = null);
        Task<SignInResult> GetExternalInfoAsync();
    }
}
