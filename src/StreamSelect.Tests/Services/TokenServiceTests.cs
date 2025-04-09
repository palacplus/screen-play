using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Duende.IdentityServer.EntityFramework.Options;
using StreamSelect.Configuration;
using StreamSelect.Data;
using StreamSelect.Models;
using StreamSelect.Services;

namespace StreamSelect.Tests.Services;

public class TokenServiceTests
{
    private readonly UserDbContext _userDbContext;
    private readonly JwtConfiguration _jwtConfig;
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        _jwtConfig = new JwtConfiguration
        {
            Key = "test_key_12345678901234567890123456789012",
            Issuer = "test_issuer",
            Audience = "test_audience",
            ExpirationMinutes = 60
        };
        var dbContextOptions = new DbContextOptionsBuilder<UserDbContext>().UseInMemoryDatabase("UserDatabase").Options;
        _userDbContext = new UserDbContext(dbContextOptions, Options.Create(new OperationalStoreOptions()));
        _tokenService = new TokenService(_userDbContext, Options.Create(_jwtConfig));
    }

    [Fact]
    public void GenerateAccessToken_ShouldReturnValidJwtToken()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };

        // Act
        var token = _tokenService.GenerateAccessToken(user);

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
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Assert
        refreshToken.Should().NotBeNullOrEmpty();
        refreshToken.Length.Should().BeGreaterThan(0);
    }

    [Fact]
    public void TryGetClaimFromExpiredToken_ShouldReturnEmail_WhenTokenIsValid()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };
        var token = _tokenService.GenerateAccessToken(user);

        // Act
        var email = _tokenService.TryGetClaimFromExpiredToken(token, ClaimTypes.Email);

        // Assert
        email.Should().NotBeNullOrEmpty();
        email.Should().Be(user.Email);
    }

    [Fact]
    public void TryGetClaimFromExpiredToken_ShouldThrowException_WhenTokenIsInvalid()
    {
        // Arrange
        var invalidToken = "invalid_token";

        // Act
        Action act = () => _tokenService.TryGetClaimFromExpiredToken(invalidToken, ClaimTypes.Email);

        // Assert
        act.Should().Throw<SecurityTokenMalformedException>();
    }

    [Fact]
    public async Task SetTokensForUserAsync_ShouldStoreTokensInDatabase()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };
        var accessToken = "access_token";
        var refreshToken = "refresh_token";

        var tokenInfo = new TokenInfo
        {
            Username = user.Email,
            AccessToken = "old_access_token",
            RefreshToken = "old_refresh_token",
            ExpiredAt = DateTime.UtcNow.AddDays(-1)
        };

        _userDbContext.ChangeTracker.Clear();
        _userDbContext.Tokens.RemoveRange(_userDbContext.Tokens);
        _userDbContext.Tokens.Add(tokenInfo);
        await _userDbContext.SaveChangesAsync();

        // Act
        await _tokenService.SetTokensForUserAsync(user, accessToken, refreshToken);

        // Assert
        var storedTokenInfo = await _userDbContext.Tokens.FirstOrDefaultAsync(t => t.Username == user.Email);
        storedTokenInfo.Should().NotBeNull();
        storedTokenInfo.Username.Should().Be(user.Email);
        storedTokenInfo.AccessToken.Should().Be(accessToken);
        storedTokenInfo.RefreshToken.Should().Be(refreshToken);
        storedTokenInfo.ExpiredAt.Should().BeCloseTo(DateTime.UtcNow.AddDays(1), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task ValidateRefreshToken_ShouldReturnTrue()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };
        var refreshToken = "refresh_token";

        var tokenInfo = new TokenInfo
        {
            Username = user.Email,
            RefreshToken = refreshToken,
            ExpiredAt = DateTime.UtcNow.AddDays(1)
        };

        _userDbContext.ChangeTracker.Clear();
        _userDbContext.Tokens.RemoveRange(_userDbContext.Tokens);
        _userDbContext.Tokens.Add(tokenInfo);
        await _userDbContext.SaveChangesAsync();

        // Act
        var result = _tokenService.ValidateRefreshToken(user, refreshToken);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ValidateRefreshToken_ShouldReturnFalse_ExpiredToken()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };
        var refreshToken = "refresh_token";

        var tokenInfo = new TokenInfo
        {
            Username = user.Email,
            RefreshToken = refreshToken,
            ExpiredAt = DateTime.UtcNow.AddDays(-1)
        };

        _userDbContext.ChangeTracker.Clear();
        _userDbContext.Tokens.RemoveRange(_userDbContext.Tokens);
        _userDbContext.Tokens.Add(tokenInfo);
        await _userDbContext.SaveChangesAsync();

        // Act
        var result = _tokenService.ValidateRefreshToken(user, refreshToken);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeTokensAsync_ShouldRemoveTokensFromDatabase()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };

        var tokenInfo = new TokenInfo
        {
            Username = user.Email,
            AccessToken = "access_token",
            RefreshToken = "refresh_token",
            ExpiredAt = DateTime.UtcNow.AddDays(1)
        };

        _userDbContext.ChangeTracker.Clear();
        _userDbContext.Tokens.RemoveRange(_userDbContext.Tokens);
        _userDbContext.Tokens.Add(tokenInfo);
        await _userDbContext.SaveChangesAsync();

        // Act
        await _tokenService.RevokeTokensAsync(user);

        // Assert
        var storedTokenInfo = await _userDbContext.Tokens.FirstOrDefaultAsync(t => t.Username == user.Email);
        storedTokenInfo.Should().BeNull();
    }
}
