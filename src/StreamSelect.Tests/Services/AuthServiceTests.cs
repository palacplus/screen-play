using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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
    private readonly JwtConfiguration _jwtConfig = new JwtConfiguration
    {
        Key = "test_key_12345678901234567890123456789012",
        Issuer = "test_issuer",
        Audience = "test_audience",
        ExpirationMinutes = 60
    };

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
            _jwtConfig
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

        // Act
        var result = await _authService.RegisterAsync(loginInfo, "User");

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(loginInfo.Email);
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

        // Act
        var result = await _authService.LoginAsync(loginInfo);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        _userManager
            .ReceivedWithAnyArgs()
            .SetAuthenticationTokenAsync(default, Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task RefreshTokenAsync_ShouldReturnNewTokens_WhenRefreshTokenIsValid()
    {
        // Arrange
        var appUser = new AppUser { Email = "user@example.com" };
        var tokenInfo = new TokenInfo
        {
            AccessToken = TokenManager.GenerateEncodedToken(appUser, _jwtConfig),
            RefreshToken = "valid_refresh_token"
        };

        _userManager.FindByEmailAsync(Arg.Any<string>()).Returns(appUser);
        _userManager
            .VerifyUserTokenAsync(appUser, Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
            .Returns(true);

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
        // Act
        await _authService.LogoutAsync();

        // Assert
        await _signInManager.Received(1).SignOutAsync();
    }
}
