using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using StreamSelect.Dtos;
using StreamSelect.Models;

namespace StreamSelect.Services;

public class AuthService : IAuthService
{
    private readonly SignInManager<AppUser> _signInManager;
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ILogger<AuthService> _logger;
    private readonly IEnumerable<AuthenticationScheme> _externalLogins;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ITokenService _tokenService;

    public AuthService(
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole> roleManager,
        SignInManager<AppUser> signInManager,
        ILogger<AuthService> logger,
        IHttpContextAccessor httpContextAccessor,
        ITokenService tokenService
    )
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _signInManager = signInManager;
        _logger = logger;
        _externalLogins = _signInManager.GetExternalAuthenticationSchemesAsync().Result.ToList();
        _httpContextAccessor = httpContextAccessor;
        _tokenService = tokenService;
    }

    public async Task<SignInResult> GetExternalInfoAsync()
    {
        var info = await _signInManager.PasswordSignInAsync("mpalacio123@gmail.com", "", isPersistent: false, false);
        return info;
    }

    public async Task<AuthResponse> RegisterAsync(LoginInfo loginInfo, string role)
    {
        var user = CreateUser();
        var result = await _userManager.CreateAsync(user, loginInfo.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(err => err.Description));
            _logger.LogError("User registration failed: {errors}", errors);
            return new AuthResponse() { ErrorMessage = $"User registration failed : {result.Errors}" };
        }

        _logger.LogInformation("User created a new account with password.");
        await _userManager.SetEmailAsync(user, loginInfo.Email);

        if (loginInfo.IsExternalLogin)
        {
            user = await AddExternalUserLoginAsync(user);
            if (user == null)
            {
                _logger.LogError("Failed to add external login to user.");
                return new AuthResponse() { ErrorMessage = "Failed to add external login" };
            }
        }
        // TODO: Send email confirmation link
        // var userId = await _userManager.GetUserIdAsync(user);
        // var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);

        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole(role));
        }
        await _userManager.AddToRoleAsync(user, role);

        var loginResult = await SignInAsync(loginInfo);
        if (!loginResult.Succeeded)
        {
            _logger.LogError("User login failed after registration.");
            return new AuthResponse();
        }
        user = await _userManager.FindByEmailAsync(loginInfo.Email);
        if (user == null)
        {
            _logger.LogError("User not found after registration.");
            return new AuthResponse() { ErrorMessage = "User not found" };
        }
        var tokenInfo = await GetUserTokensAsync(user);
        return new AuthResponse { Token = tokenInfo.AccessToken, RefreshToken = tokenInfo.RefreshToken };
    }

    public async Task<AuthResponse> LoginAsync(LoginInfo loginInfo)
    {
        // Clear the existing external cookie to ensure a clean login process
        var context = _httpContextAccessor.HttpContext;
        if (context != null)
        {
            await context.SignOutAsync(IdentityConstants.ExternalScheme);
        }

        var result = await SignInAsync(loginInfo);

        if (result.Succeeded)
        {
            _logger.LogInformation("User logged in.");
            var user = await _userManager.FindByEmailAsync(loginInfo.Email);
            if (user == null)
            {
                _logger.LogError("User not found after login.");
                return new AuthResponse
                {
                    Token = null,
                    RefreshToken = null,
                    ErrorMessage = "User not found"
                };
            }
            var tokenInfo = await GetUserTokensAsync(user);
            return new AuthResponse { Token = tokenInfo.AccessToken, RefreshToken = tokenInfo.RefreshToken };
        }

        var response = new AuthResponse();
        if (result.IsNotAllowed)
        {
            response.ErrorMessage = "User is not allowed to login.";
        }
        else if (result.IsLockedOut)
        {
            response.ErrorMessage = "User account locked out.";
        }
        else
        {
            response.ErrorMessage = "Invalid login attempt. ";
        }
        _logger.LogError(
            "User login failed with result {result}: {errorMessage}",
            result.ToString(),
            response.ErrorMessage
        );
        return response;
    }

    public async Task<AuthResponse> RefreshTokenAsync(TokenInfo tokenInfo)
    {
        var email = _tokenService.TryGetClaimFromExpiredToken(tokenInfo.AccessToken, ClaimTypes.Email);
        if (email == null)
        {
            return new AuthResponse
            {
                Token = null,
                RefreshToken = null,
                ErrorMessage = "Invalid token",
            };
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return new AuthResponse { ErrorMessage = "User not found" };
        }

        var isValidToken = _tokenService.ValidateRefreshToken(user, tokenInfo.RefreshToken);
        if (!isValidToken)
        {
            return new AuthResponse { ErrorMessage = "Invalid refresh token", };
        }

        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        await _tokenService.SetTokensForUserAsync(user, newAccessToken, newRefreshToken);

        return new AuthResponse { Token = newAccessToken, RefreshToken = newRefreshToken };
    }

    public async Task LogoutAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        await _tokenService.RevokeTokensAsync(user);
        await _signInManager.SignOutAsync();
        _logger.LogInformation("User logged out.");
    }

    private AppUser CreateUser()
    {
        try
        {
            return Activator.CreateInstance<AppUser>();
        }
        catch
        {
            throw new InvalidOperationException(
                $"Can't create an instance of '{nameof(AppUser)}'. "
                    + $"Ensure that '{nameof(AppUser)}' is not an abstract class and has a parameterless constructor, or alternatively "
                    + $"override the register page in /Areas/Identity/Pages/Account/Register.cshtml"
            );
        }
    }

    private async Task<AppUser?> AddExternalUserLoginAsync(AppUser user)
    {
        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            _logger.LogError("External login info not found");
            return null;
        }

        var result = await _userManager.AddLoginAsync(user, info);
        if (result.Succeeded)
        {
            _logger.LogInformation("User linked external login.");
            return user;
        }
        else
        {
            _logger.LogError("External login failed: {errors}", result.Errors.ToString());
            return null;
        }
    }

    private async Task<SignInResult> SignInAsync(LoginInfo loginInfo)
    {
        if (loginInfo.IsExternalLogin)
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                _logger.LogError("External login info not found");
                return new SignInResult();
            }

            return await _signInManager.ExternalLoginSignInAsync(
                info.LoginProvider,
                info.ProviderKey,
                isPersistent: false
            );
        }
        return await _signInManager.PasswordSignInAsync(
            loginInfo.Email,
            loginInfo.Password,
            loginInfo.RememberMe,
            lockoutOnFailure: false
        );
    }

    private async Task<TokenInfo> GetUserTokensAsync(AppUser user)
    {
        var token = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        return await _tokenService.SetTokensForUserAsync(user, token, refreshToken);
    }
}
