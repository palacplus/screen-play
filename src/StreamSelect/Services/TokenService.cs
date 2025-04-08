using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using StreamSelect.Configuration;
using StreamSelect.Data;
using StreamSelect.Models;

namespace StreamSelect.Services;

public class TokenService : ITokenService
{
    private readonly JwtConfiguration _jwtConfig;
    private readonly UserDbContext _userDbContext;

    public TokenService(UserDbContext userDbContext, IOptions<JwtConfiguration> jwtOptions)
    {
        _userDbContext = userDbContext;
        _jwtConfig = jwtOptions.Value;
    }

    public string GenerateAccessToken(AppUser user)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? throw new ArgumentNullException(nameof(user.Email))),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpirationMinutes),
            SigningCredentials = creds,
            Issuer = _jwtConfig.Issuer,
            Audience = _jwtConfig.Audience
        };
        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var generator = RandomNumberGenerator.Create();
        generator.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public string? TryGetEmailFromExpiredToken(string accessToken)
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

        return principal.FindFirstValue(ClaimTypes.Email);
    }

    public async Task<TokenInfo> SetTokensForUserAsync(AppUser user, string accessToken, string refreshToken)
    {
        var tokenInfo = _userDbContext.Tokens.FirstOrDefault(a => a.Username == user.Email);

        if (tokenInfo == null)
        {
            var ti = new TokenInfo
            {
                Username = user.Email,
                RefreshToken = refreshToken,
                AccessToken = accessToken,
                ExpiredAt = DateTime.UtcNow.AddDays(1)
            };
            _userDbContext.Tokens.Add(ti);
        }
        else
        {
            tokenInfo.AccessToken = accessToken;
            tokenInfo.RefreshToken = refreshToken;
            tokenInfo.ExpiredAt = DateTime.UtcNow.AddDays(1);
        }

        await _userDbContext.SaveChangesAsync();
        return _userDbContext.Tokens.First(a => a.Username == user.Email);
    }

    public bool ValidateRefreshToken(AppUser user, string refreshToken)
    {
        var tokenInfo = _userDbContext.Tokens.FirstOrDefault(a =>
            a.RefreshToken == refreshToken && a.Username == user.Email
        );
        if (tokenInfo == null)
            return false;

        if (tokenInfo.ExpiredAt < DateTime.UtcNow)
            return false;

        return true;
    }
}
