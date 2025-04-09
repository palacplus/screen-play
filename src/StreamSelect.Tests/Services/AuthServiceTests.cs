using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using StreamSelect.Configuration;
using StreamSelect.Dtos;
using StreamSelect.Models;
using StreamSelect.Services;

namespace StreamSelect.Tests.Services;

public class AuthServiceTests
{
    private readonly UserManager<AppUser> _userManager = Substitute.For<UserManager<AppUser>>(
        Substitute.For<IUserStore<AppUser>>(),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    );
    private readonly RoleManager<IdentityRole> _roleManager = Substitute.For<RoleManager<IdentityRole>>(
        Substitute.For<IRoleStore<IdentityRole>>(),
        null,
        null,
        null,
        null
    );
    private readonly SignInManager<AppUser> _signInManager = Substitute.For<SignInManager<AppUser>>(
        Substitute.For<UserManager<AppUser>>(
            Substitute.For<IUserStore<AppUser>>(),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ),
        Substitute.For<IHttpContextAccessor>(),
        Substitute.For<IUserClaimsPrincipalFactory<AppUser>>(),
        null,
        null,
        null,
        null
    );
    private readonly ILogger<AuthService> _logger = Substitute.For<ILogger<AuthService>>();
    private readonly IHttpContextAccessor _httpContextAccessor = Substitute.For<IHttpContextAccessor>();
    private readonly ITokenService _tokenService = Substitute.For<ITokenService>();

    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userManager.SupportsUserEmail.Returns(true);
        _authService = new AuthService(
            _userManager,
            _roleManager,
            _signInManager,
            _logger,
            _httpContextAccessor,
            _tokenService
        );
    }

    [Fact]
    public async Task GetExternalInfoAsync_ShouldReturnSignInResult()
    {
        // Arrange
        var expectedResult = SignInResult.Success;
        _signInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), false, false).Returns(expectedResult);

        // Act
        var result = await _authService.GetExternalInfoAsync();

        // Assert
        result.Should().Be(expectedResult);
    }

    [Fact]
    public async Task RegisterAsync_ShouldCreateUserAndAssignRole()
    {
        // Arrange
        var loginInfo = new LoginInfo { Email = "user@example.com", Password = "password" };
        var appUser = new AppUser { Email = loginInfo.Email };
        _userManager.CreateAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _userManager.SetEmailAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _roleManager.RoleExistsAsync(Arg.Any<string>()).Returns(false);
        _roleManager.CreateAsync(Arg.Any<IdentityRole>()).Returns(IdentityResult.Success);
        _userManager.FindByEmailAsync(Arg.Any<string>()).Returns(appUser);
        _userManager.AddToRoleAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _signInManager
            .PasswordSignInAsync(loginInfo.Email, loginInfo.Password, true, false)
            .Returns(Task.FromResult(SignInResult.Success));

        _tokenService.GenerateAccessToken(appUser).Returns("access_token");
        _tokenService.GenerateRefreshToken().Returns("refresh_token");
        _tokenService
            .SetTokensForUserAsync(appUser, Arg.Any<string>(), Arg.Any<string>())
            .Returns(Task.FromResult(new TokenInfo { AccessToken = "access_token", RefreshToken = "refresh_token" }));

        // Act
        var result = await _authService.RegisterAsync(loginInfo, "User");

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        await _userManager.Received(1).CreateAsync(Arg.Any<AppUser>(), loginInfo.Password);
        await _userManager.Received(1).SetEmailAsync(Arg.Any<AppUser>(), loginInfo.Email);
        await _roleManager.Received(1).RoleExistsAsync("User");
        await _roleManager.Received(1).CreateAsync(Arg.Is<IdentityRole>(r => r.Name == "User"));
        await _userManager.Received(1).AddToRoleAsync(Arg.Any<AppUser>(), "User");
        await _tokenService.Received(1).SetTokensForUserAsync(appUser, "access_token", "refresh_token");
        await _signInManager.Received(1).PasswordSignInAsync(loginInfo.Email, loginInfo.Password, true, false);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnAuthResponse_WhenLoginIsSuccessful()
    {
        // Arrange
        var loginInfo = new LoginInfo { Email = "user@example.com", Password = "password" };
        var appUser = new AppUser { Email = loginInfo.Email };

        _httpContextAccessor.HttpContext = null;

        _signInManager
            .PasswordSignInAsync(loginInfo.Email, loginInfo.Password, loginInfo.RememberMe, false)
            .Returns(Task.FromResult(SignInResult.Success));
        _userManager.FindByEmailAsync(Arg.Any<string>()).Returns(appUser);
        _tokenService.GenerateAccessToken(appUser).Returns("access_token");
        _tokenService.GenerateRefreshToken().Returns("refresh_token");
        _tokenService
            .SetTokensForUserAsync(appUser, Arg.Any<string>(), Arg.Any<string>())
            .Returns(Task.FromResult(new TokenInfo { AccessToken = "access_token", RefreshToken = "refresh_token" }));

        // Act
        var result = await _authService.LoginAsync(loginInfo);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        await _tokenService.Received(1).SetTokensForUserAsync(appUser, "access_token", "refresh_token");
        await _signInManager
            .Received(1)
            .PasswordSignInAsync(loginInfo.Email, loginInfo.Password, loginInfo.RememberMe, false);
    }

    [Fact]
    public async Task RefreshTokenAsync_ShouldReturnNewTokens_WhenRefreshTokenIsValid()
    {
        // Arrange
        var appUser = new AppUser { Email = "user@example.com" };
        var tokenInfo = new TokenInfo { AccessToken = "valid_access_token", RefreshToken = "valid_refresh_token" };

        _tokenService.TryGetClaimFromExpiredToken(tokenInfo.AccessToken, ClaimTypes.Email).Returns(appUser.Email);
        _tokenService.ValidateRefreshToken(appUser, tokenInfo.RefreshToken).Returns(true);
        _tokenService.GenerateAccessToken(appUser).Returns("new_access_token");
        _tokenService.GenerateRefreshToken().Returns("new_refresh_token");
        _tokenService
            .SetTokensForUserAsync(appUser, Arg.Any<string>(), Arg.Any<string>())
            .Returns(
                Task.FromResult(new TokenInfo { AccessToken = "new_access_token", RefreshToken = "new_refresh_token" })
            );
        _userManager.FindByEmailAsync(Arg.Any<string>()).Returns(appUser);

        // Act
        var result = await _authService.RefreshTokenAsync(tokenInfo);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LogoutAsync_ShouldSignOutUser()
    {
        // Arrange
        var email = "user@example.com";
        var appUser = new AppUser { Email = email };

        _userManager.FindByEmailAsync(email).Returns(appUser);

        // Act
        await _authService.LogoutAsync(email);

        // Assert
        await _userManager.Received(1).FindByEmailAsync(email);
        await _tokenService.Received(1).RevokeTokensAsync(appUser);
        await _signInManager.Received(1).SignOutAsync();
    }
}
