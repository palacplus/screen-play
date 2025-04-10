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

    public async Task<AppUser?> GetUserByEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            _logger.LogError("No user exists with email: {email}", email);
            return null;
        }
        return user;
    }

    public async Task<bool> DeleteUserAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            _logger.LogError("No user exists with email: {email}", email);
            return false;
        }
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join("\n", result.Errors.Select(err => err.Description));
            _logger.LogError("User deletion failed: {errors}", errors);
            return false;
        }
        return true;
    }

    public async Task<AuthResponse> RegisterAsync(LoginRequest request, string role)
    {
        var user = CreateUser();
        user.UserName = request.Email;
        user.Email = request.Email;

        // TODO: Handle email confirmation below without explicitly setting it here.
        user.EmailConfirmed = true;
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join("\n", result.Errors.Select(err => err.Description));
            _logger.LogError("User registration failed: {errors}", errors);
            return new AuthResponse() { ErrorMessage = $"User registration failed : {errors}" };
        }

        _logger.LogInformation("User created a new account with password.");
        await _userManager.SetEmailAsync(user, request.Email);

        if (request.IsExternalLogin)
        {
            user = await AddExternalUserLoginAsync(user);
            if (user == null)
            {
                _logger.LogError("Failed to add external login to user.");
                await _userManager.DeleteAsync(user);
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

        var loginResponse = await LoginAsync(request);
        if (loginResponse.Token == null)
        {
            await _userManager.DeleteAsync(user);
        }
        return loginResponse;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // Clear the existing external cookie to ensure a clean login process
        var context = _httpContextAccessor.HttpContext;
        if (context != null)
        {
            await context.SignOutAsync(IdentityConstants.ExternalScheme);
        }

        var result = await SignInAsync(request);

        if (result.Succeeded)
        {
            _logger.LogInformation("User logged in.");
            var user = await _userManager.FindByEmailAsync(request.Email);
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

        var response = new AuthResponse() { ErrorMessage = result.ToString() };
        _logger.LogError("User login failed with result: {result}", result.ToString());
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

        return new AuthResponse
        {
            Token = _tokenService.GenerateAccessToken(user),
            RefreshToken = tokenInfo.RefreshToken
        };
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

    private async Task<SignInResult> SignInAsync(LoginRequest request)
    {
        if (request.IsExternalLogin)
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
            request.Email,
            request.Password,
            request.RememberMe,
            lockoutOnFailure: false
        );
    }

    private async Task<TokenInfo> GetUserTokensAsync(AppUser user)
    {
        var refreshToken = _tokenService.GenerateRefreshToken();
        var tokenInfo = await _tokenService.SetRefreshTokenForUserAsync(user, refreshToken);
        tokenInfo.AccessToken = _tokenService.GenerateAccessToken(user);
        return tokenInfo;
    }
}
