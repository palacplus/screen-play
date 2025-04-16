using System.Security.Claims;
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Services
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
