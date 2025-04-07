using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using Microsoft.IdentityModel.Tokens;
using StreamSelect.Configuration;
using StreamSelect.Models;
using StreamSelect.Services;
using Xunit;

namespace StreamSelect.Tests.Services;

public class TokenManagerTests
{
    private readonly JwtConfiguration _jwtConfig;

    public TokenManagerTests()
    {
        _jwtConfig = new JwtConfiguration
        {
            Key = "test_key_12345678901234567890123456789012",
            Issuer = "test_issuer",
            Audience = "test_audience",
            ExpirationMinutes = 60
        };
    }

    [Fact]
    public void GenerateEncodedToken_ShouldReturnValidJwtToken()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };

        // Act
        var token = TokenManager.GenerateEncodedToken(user, _jwtConfig);

        // Assert
        token.Should().NotBeNullOrEmpty();

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(
            token,
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = _jwtConfig.Issuer,
                ValidAudience = _jwtConfig.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_jwtConfig.Key)),
                ValidateLifetime = true
            },
            out SecurityToken validatedToken
        );

        principal.Should().NotBeNull();
        validatedToken.Should().BeOfType<JwtSecurityToken>();
    }

    [Fact]
    public void GenerateRefreshToken_ShouldReturnValidToken()
    {
        // Act
        var refreshToken = TokenManager.GenerateRefreshToken();

        // Assert
        refreshToken.Should().NotBeNullOrEmpty();
        refreshToken.Length.Should().BeGreaterThan(0);
    }

    [Fact]
    public void GetPrincipalFromExpiredToken_ShouldReturnClaimsPrincipal_WhenTokenIsValid()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };
        var token = TokenManager.GenerateEncodedToken(user, _jwtConfig);

        // Act
        var principal = TokenManager.GetPrincipalFromExpiredToken(token, _jwtConfig);

        // Assert
        principal.Should().NotBeNull();
        principal.Identity.Should().NotBeNull();
        principal.Identity!.IsAuthenticated.Should().BeTrue();
        principal.FindFirst(ClaimTypes.Email)?.Value.Should().Be(user.Email);
    }

    [Fact]
    public void GetPrincipalFromExpiredToken_ShouldThrowException_WhenTokenIsInvalid()
    {
        // Arrange
        var invalidToken = "invalid_token";

        // Act
        Action act = () => TokenManager.GetPrincipalFromExpiredToken(invalidToken, _jwtConfig);

        // Assert
        act.Should().Throw<SecurityTokenMalformedException>();
    }
}
