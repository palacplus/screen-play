using System.Security.Claims;
using StreamSelect.Models;

namespace StreamSelect.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(AppUser user);
        string GenerateRefreshToken();
        string? TryGetClaimFromExpiredToken(string accessToken, string claimType);
        Task<TokenInfo> SetTokensForUserAsync(AppUser user, string accessToken, string refreshToken);
        bool ValidateRefreshToken(AppUser user, string token);
        Task RevokeTokensAsync(AppUser user);
    }
}
