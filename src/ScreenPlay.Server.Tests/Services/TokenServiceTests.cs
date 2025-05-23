using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Duende.IdentityServer.EntityFramework.Options;
using ScreenPlay.Server.Configuration;
using ScreenPlay.Server.Data;
using ScreenPlay.Server.Models;
using ScreenPlay.Server.Services;

namespace ScreenPlay.Server.Tests.Services;

public class TokenServiceTests
{
    private readonly AppDbContext _dbContext;
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
        var dbContextOptions = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase("UserDatabase").Options;
        _dbContext = new AppDbContext(dbContextOptions, Options.Create(new OperationalStoreOptions()));
        _tokenService = new TokenService(_dbContext, Options.Create(_jwtConfig));
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
    public async Task GetUserTokensAsync_ShouldStoreNewTokensInDatabase()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };

        _dbContext.ChangeTracker.Clear();
        _dbContext.Tokens.RemoveRange(_dbContext.Tokens);
        await _dbContext.SaveChangesAsync();

        // Act
        await _tokenService.GetUserTokensAsync(user);

        // Assert
        var storedTokenInfo = await _dbContext.Tokens.FirstOrDefaultAsync(t => t.UserId == user.Id);
        storedTokenInfo.Should().NotBeNull();
        storedTokenInfo.UserId.Should().Be(user.Id);
        storedTokenInfo.RefreshToken.Should().NotBeNullOrEmpty();
        storedTokenInfo.AccessToken.Should().NotBeNullOrEmpty();
        storedTokenInfo.ExpiredAt.Should().BeCloseTo(DateTime.UtcNow.AddDays(1), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task GetUserTokensAsync_ShouldUpdateTokensInDatabase()
    {
        // Arrange
        var user = new AppUser { Id = "123", Email = "user@example.com" };
        var tokenInfo = new TokenInfo
        {
            UserId = user.Id,
            AccessToken = "old_access_token",
            RefreshToken = "old_refresh_token",
            ExpiredAt = DateTime.UtcNow.AddDays(-1)
        };

        _dbContext.ChangeTracker.Clear();
        _dbContext.Tokens.RemoveRange(_dbContext.Tokens);
        _dbContext.Tokens.Add(tokenInfo);
        await _dbContext.SaveChangesAsync();

        // Act
        await _tokenService.GetUserTokensAsync(user);

        // Assert
        var storedTokenInfo = await _dbContext.Tokens.FirstOrDefaultAsync(t => t.UserId == user.Id);
        storedTokenInfo.Should().NotBeNull();
        storedTokenInfo.UserId.Should().Be(user.Id);
        storedTokenInfo.RefreshToken.Should().NotBe("old_refresh_token");
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
            UserId = user.Id,
            RefreshToken = refreshToken,
            ExpiredAt = DateTime.UtcNow.AddDays(1)
        };

        _dbContext.ChangeTracker.Clear();
        _dbContext.Tokens.RemoveRange(_dbContext.Tokens);
        _dbContext.Tokens.Add(tokenInfo);
        await _dbContext.SaveChangesAsync();

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
            UserId = user.Id,
            RefreshToken = refreshToken,
            ExpiredAt = DateTime.UtcNow.AddDays(-1)
        };

        _dbContext.ChangeTracker.Clear();
        _dbContext.Tokens.RemoveRange(_dbContext.Tokens);
        _dbContext.Tokens.Add(tokenInfo);
        await _dbContext.SaveChangesAsync();

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
            UserId = user.Id,
            AccessToken = "access_token",
            RefreshToken = "refresh_token",
            ExpiredAt = DateTime.UtcNow.AddDays(1)
        };

        _dbContext.ChangeTracker.Clear();
        _dbContext.Tokens.RemoveRange(_dbContext.Tokens);
        _dbContext.Tokens.Add(tokenInfo);
        await _dbContext.SaveChangesAsync();

        // Act
        await _tokenService.RevokeTokensAsync(user);

        // Assert
        var storedTokenInfo = await _dbContext.Tokens.FirstOrDefaultAsync(t => t.UserId == user.Id);
        storedTokenInfo.Should().BeNull();
    }
}
