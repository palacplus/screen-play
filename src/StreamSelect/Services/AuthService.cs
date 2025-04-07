using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using StreamSelect.Configuration;
using StreamSelect.Dtos;
using StreamSelect.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace StreamSelect.Services;

public class AuthService : IAuthService
{
    private readonly SignInManager<AppUser> _signInManager;
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ILogger<AuthService> _logger;
    private readonly IEnumerable<AuthenticationScheme> _externalLogins;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly JwtConfiguration _jwtConfig;

    public AuthService(
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole> roleManager,
        SignInManager<AppUser> signInManager,
        ILogger<AuthService> logger,
        IHttpContextAccessor httpContextAccessor,
        JwtConfiguration jwtConfig
    )
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _signInManager = signInManager;
        _logger = logger;
        _externalLogins = _signInManager.GetExternalAuthenticationSchemesAsync().Result.ToList();
        _httpContextAccessor = httpContextAccessor;
        _jwtConfig = jwtConfig;
    }

    public async Task<SignInResult> GetExternalInfoAsync()
    {
        var info = await _signInManager.PasswordSignInAsync("mpalacio123@gmail.com", "", isPersistent: false, false);
        return info;
    }

    public async Task<AppUser?> RegisterAsync(LoginInfo loginInfo, string role)
    {
        var user = CreateUser();
        var result = await _userManager.CreateAsync(user, loginInfo.Password);

        if (result.Succeeded)
        {
            _logger.LogInformation("User created a new account with password.");
            await _userManager.SetEmailAsync(user, loginInfo.Email);

            if (loginInfo.IsExternalLogin)
            {
                user = await AddExternalUserLoginAsync(user);
                if (user == null)
                {
                    _logger.LogError("Failed to add external login to user.");
                    return null;
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
        }
        else
        {
            _logger.LogError("User registration failed: {errors}", result.Errors.ToString());
            return null;
        }
        return await _userManager.FindByEmailAsync(loginInfo.Email);
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
            var token = TokenManager.GenerateEncodedToken(user, _jwtConfig);
            await _userManager.RemoveAuthenticationTokenAsync(user, string.Empty, "refresh_token");
            var refreshToken = TokenManager.GenerateRefreshToken();
            await _userManager.SetAuthenticationTokenAsync(user, string.Empty, "refresh_token", refreshToken);
            return new AuthResponse
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpirationMinutes),
                RefreshToken = null,
            };
        }

        var response = new AuthResponse
        {
            Token = null,
            Expiration = DateTime.UtcNow,
            RefreshToken = null,
        };
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
            response.ErrorMessage = "Invalid login attempt.";
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
        var principal = TokenManager.GetPrincipalFromExpiredToken(tokenInfo.AccessToken, _jwtConfig);
        var email = principal.FindFirstValue(ClaimTypes.Email);
        if (email == null)
        {
            return new AuthResponse
            {
                Token = null,
                Expiration = DateTime.UtcNow,
                RefreshToken = null,
                ErrorMessage = "Invalid token",
            };
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return new AuthResponse
            {
                Token = null,
                Expiration = DateTime.UtcNow,
                RefreshToken = null,
                ErrorMessage = "User not found",
            };
        }

        var isValidToken = await _userManager.VerifyUserTokenAsync(
            user,
            string.Empty,
            "refresh_token",
            tokenInfo.RefreshToken
        );
        if (!isValidToken)
        {
            return new AuthResponse
            {
                Token = null,
                Expiration = DateTime.UtcNow,
                RefreshToken = null,
                ErrorMessage = "Invalid refresh token",
            };
        }

        await _userManager.RemoveAuthenticationTokenAsync(user, string.Empty, "refresh_token");
        var newAccessToken = TokenManager.GenerateEncodedToken(user, _jwtConfig);
        var newRefreshToken = TokenManager.GenerateRefreshToken();
        await _userManager.SetAuthenticationTokenAsync(user, string.Empty, "refresh_token", newRefreshToken);

        return new AuthResponse
        {
            Token = newAccessToken,
            Expiration = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpirationMinutes),
            RefreshToken = newRefreshToken,
        };
    }

    public async Task LogoutAsync()
    {
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

    private async Task<AppUser> AddExternalUserLoginAsync(AppUser user)
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
}
