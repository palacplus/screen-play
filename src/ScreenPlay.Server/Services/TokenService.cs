using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ScreenPlay.Server.Configuration;
using ScreenPlay.Server.Data;
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Services;

public class TokenService : ITokenService
{
    private readonly JwtConfiguration _jwtConfig;
    private readonly AppDbContext _dbContext;

    public TokenService(AppDbContext dbContext, IOptions<JwtConfiguration> jwtOptions)
    {
        _dbContext = dbContext;
        _jwtConfig = jwtOptions.Value;
    }

    public string GenerateAccessToken(AppUser user)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? throw new ArgumentNullException(nameof(user.Email))),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpirationMinutes),
            SigningCredentials = creds,
            Issuer = _jwtConfig.Issuer,
            Audience = _jwtConfig.Audience,
        };
        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string? TryGetClaimFromExpiredToken(string accessToken, string claimType)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidAudience = _jwtConfig.Audience,
            ValidIssuer = _jwtConfig.Issuer,
            ValidateLifetime = false,
            ClockSkew = TimeSpan.Zero,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Key)),
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        var principal = tokenHandler.ValidateToken(
            accessToken,
            tokenValidationParameters,
            out SecurityToken securityToken
        );

        var jwtSecurityToken = securityToken as JwtSecurityToken;
        if (
            jwtSecurityToken == null
            || !jwtSecurityToken.Header.Alg.Equals(
                SecurityAlgorithms.HmacSha256,
                StringComparison.InvariantCultureIgnoreCase
            )
        )
        {
            throw new SecurityTokenException("Invalid token");
        }

        return principal.FindFirstValue(claimType);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var generator = RandomNumberGenerator.Create();
        generator.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public async Task<TokenInfo> GetUserTokensAsync(AppUser user)
    {
        var refreshToken = GenerateRefreshToken();
        var tokenInfo = _dbContext.Tokens.FirstOrDefault(a => a.UserId == user.Id);
        if (tokenInfo == null)
        {
            tokenInfo = new TokenInfo
            {
                UserId = user.Id,
                RefreshToken = refreshToken,
                ExpiredAt = DateTime.UtcNow.AddDays(1),
            };
            _dbContext.Tokens.Add(tokenInfo);
        }
        else
        {
            tokenInfo.RefreshToken = refreshToken;
            tokenInfo.ExpiredAt = DateTime.UtcNow.AddDays(1);
        }
        tokenInfo.AccessToken = GenerateAccessToken(user);
        await _dbContext.SaveChangesAsync();
        return tokenInfo;
    }

    public bool ValidateRefreshToken(AppUser user, string refreshToken)
    {
        var tokenInfo = _dbContext.Tokens.FirstOrDefault(a => a.RefreshToken == refreshToken && a.UserId == user.Id);
        if (tokenInfo == null)
            return false;

        if (tokenInfo.ExpiredAt < DateTime.UtcNow)
            return false;

        return true;
    }

    public async Task RevokeTokensAsync(AppUser user)
    {
        var tokenInfo = _dbContext.Tokens.FirstOrDefault(a => a.UserId == user.Id);
        if (tokenInfo != null)
        {
            _dbContext.Tokens.Remove(tokenInfo);
            await _dbContext.SaveChangesAsync();
        }
    }
}
