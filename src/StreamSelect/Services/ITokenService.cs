using System.Security.Claims;
using StreamSelect.Models;

namespace StreamSelect.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(AppUser user);
        string GenerateRefreshToken();
        string? TryGetClaimFromExpiredToken(string accessToken, string claimType);
        Task<TokenInfo> SetRefreshTokenForUserAsync(AppUser user, string refreshToken);
        bool ValidateRefreshToken(AppUser user, string token);
        Task RevokeTokensAsync(AppUser user);
    }
}
