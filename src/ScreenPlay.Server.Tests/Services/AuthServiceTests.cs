using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Google.Apis.Auth;
using ScreenPlay.Server.Configuration;
using ScreenPlay.Server.Dtos;
using ScreenPlay.Server.Models;
using ScreenPlay.Server.Services;

namespace ScreenPlay.Server.Tests.Services;

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
    public async Task RegisterAsync_ShouldCreateUserAndAssignRole()
    {
        // Arrange
        var loginRequest = new LoginRequest { Email = "user@example.com", Password = "password" };
        var appUser = new AppUser { Email = loginRequest.Email };

        _httpContextAccessor.HttpContext = null;
        _userManager.CreateAsync(Arg.Any<AppUser>()).Returns(IdentityResult.Success);
        _userManager.SetEmailAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _roleManager.RoleExistsAsync(Arg.Any<string>()).Returns(false);
        _roleManager.CreateAsync(Arg.Any<IdentityRole>()).Returns(IdentityResult.Success);
        _userManager.AddPasswordAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _userManager.FindByEmailAsync(Arg.Any<string>()).Returns(appUser);
        _userManager.AddToRoleAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _signInManager
            .PasswordSignInAsync(loginRequest.Email, loginRequest.Password, true, false)
            .Returns(Task.FromResult(SignInResult.Success));

        _tokenService.GenerateAccessToken(appUser).Returns("access_token");
        _tokenService
            .GetUserTokensAsync(appUser)
            .Returns(Task.FromResult(new TokenInfo { AccessToken = "access_token", RefreshToken = "refresh_token" }));

        // Act
        var result = await _authService.RegisterAsync(loginRequest, "User");

        // Assert
        result.Should().NotBeNull();
        result.ErrorMessage.Should().BeNull();
        await _userManager.Received(1).CreateAsync(Arg.Any<AppUser>());
        await _userManager.Received(1).AddPasswordAsync(Arg.Any<AppUser>(), loginRequest.Password);
        await _userManager.Received(1).SetEmailAsync(Arg.Any<AppUser>(), loginRequest.Email);
        await _roleManager.Received(1).RoleExistsAsync("User");
        await _roleManager.Received(1).CreateAsync(Arg.Is<IdentityRole>(r => r.Name == "User"));
        await _userManager.Received(1).AddToRoleAsync(Arg.Any<AppUser>(), "User");
    }


    [Fact]
    public async Task RegisterAsync_ShouldHandleCreateUserFailure()
    {
        // Arrange
        var loginRequest = new LoginRequest { Email = "user@example.com", Password = "password" };
        var appUser = new AppUser { Email = loginRequest.Email };

        var identityError = new IdentityError
        {
            Code = "UserCreationFailed",
            Description = "User creation failed"
        };

        _httpContextAccessor.HttpContext = null;
        _userManager.CreateAsync(Arg.Any<AppUser>()).Returns(IdentityResult.Failed(new [] { identityError }));
        _userManager.SetEmailAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _roleManager.RoleExistsAsync(Arg.Any<string>()).Returns(false);
        _roleManager.CreateAsync(Arg.Any<IdentityRole>()).Returns(IdentityResult.Success);
        _userManager.AddPasswordAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _userManager.FindByEmailAsync(Arg.Any<string>()).Returns(appUser);
        _userManager.AddToRoleAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _signInManager
            .PasswordSignInAsync(loginRequest.Email, loginRequest.Password, true, false)
            .Returns(Task.FromResult(SignInResult.Success));

        _tokenService.GenerateAccessToken(appUser).Returns("access_token");
        _tokenService
            .GetUserTokensAsync(appUser)
            .Returns(Task.FromResult(new TokenInfo { AccessToken = "access_token", RefreshToken = "refresh_token" }));

        // Act
        var result = await _authService.RegisterAsync(loginRequest, "User");

        // Assert
        result.Should().NotBeNull();
        result.ErrorMessage.Should().NotBeNullOrEmpty();
        result.ErrorMessage.Should().Be(identityError.Description);
        await _userManager.Received(1).CreateAsync(Arg.Any<AppUser>());
    }

    [Fact]
    public async Task RegisterAsync_ShouldRegisterExternalUser_WhenIsExternalLoginIsTrue()
    {
        // Arrange
        var request = new ExternalLoginRequest(
            new GoogleJsonWebSignature.Payload
            {
                Email = "testEmail@mymail.com"
            }
        );
        request.IsExternalLogin.Should().BeTrue();
        var appUser = new AppUser { Email = request.Email };

        _httpContextAccessor.HttpContext = null;
        _userManager.CreateAsync(Arg.Any<AppUser>()).Returns(IdentityResult.Success);
        _userManager.SetEmailAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _roleManager.RoleExistsAsync(Arg.Any<string>()).Returns(false);
        _roleManager.CreateAsync(Arg.Any<IdentityRole>()).Returns(IdentityResult.Success);
        _userManager.AddLoginAsync(Arg.Any<AppUser>(), Arg.Any<UserLoginInfo>()).Returns(IdentityResult.Success);
        _userManager.FindByEmailAsync(Arg.Any<string>()).Returns(appUser);
        _userManager.AddToRoleAsync(Arg.Any<AppUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        _signInManager
            .ExternalLoginSignInAsync(
                request.Provider,
                request.Email,
                isPersistent: true
            )
            .Returns(Task.FromResult(SignInResult.Success));

        _tokenService.GenerateAccessToken(appUser).Returns("access_token");
        _tokenService
            .GetUserTokensAsync(appUser)
            .Returns(Task.FromResult(new TokenInfo { AccessToken = "access_token", RefreshToken = "refresh_token" }));

        // Act
        var result = await _authService.RegisterAsync(request, "User");

        // Assert
        result.Should().NotBeNull();
        result.ErrorMessage.Should().BeNull();
        await _userManager.Received(1).CreateAsync(Arg.Any<AppUser>());
        await _userManager.Received(1).AddLoginAsync(Arg.Any<AppUser>(), Arg.Is<UserLoginInfo>(l => l.LoginProvider == "Google"));
        await _userManager.Received(1).SetEmailAsync(Arg.Any<AppUser>(), request.Email);
        await _roleManager.Received(1).RoleExistsAsync("User");
        await _roleManager.Received(1).CreateAsync(Arg.Is<IdentityRole>(r => r.Name == "User"));
        await _userManager.Received(1).AddToRoleAsync(Arg.Any<AppUser>(), "User");
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnAuthResponse_WhenLoginIsSuccessful()
    {
        // Arrange
        var loginRequest = new LoginRequest { Email = "user@example.com", Password = "password" };
        var appUser = new AppUser { Email = loginRequest.Email };

        _httpContextAccessor.HttpContext = null;

        _signInManager
            .PasswordSignInAsync(loginRequest.Email, loginRequest.Password, loginRequest.RememberMe, false)
            .Returns(Task.FromResult(SignInResult.Success));
        _userManager.FindByEmailAsync(Arg.Any<string>()).Returns(appUser);
        _tokenService.GenerateAccessToken(appUser).Returns("access_token");
        _tokenService
            .GetUserTokensAsync(appUser)
            .Returns(Task.FromResult(new TokenInfo { AccessToken = "access_token", RefreshToken = "refresh_token" }));

        // Act
        var result = await _authService.LoginAsync(loginRequest);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        await _tokenService.Received(1).GetUserTokensAsync(appUser);
        await _signInManager
            .Received(1)
            .PasswordSignInAsync(loginRequest.Email, loginRequest.Password, loginRequest.RememberMe, false);
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
        _tokenService
            .GetUserTokensAsync(appUser)
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
