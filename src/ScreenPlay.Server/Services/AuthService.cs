using System.Security.Claims;
using System.Text.Json;
using System.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using ScreenPlay.Server.Dtos;
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Services;

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

    public async Task<AppUser> GetUserByEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            _logger.LogWarning("No user exists with email: {email}", email);
            return null;
        }
        return user;
    }

    public async Task<bool> DeleteUserAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            _logger.LogWarning("No user exists with email: {email}", email);
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
        var user = CreateUser(request.Email, role);

        var result = await _userManager.CreateAsync(user);
        if (!result.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            return GetFailureResponse(result);
        }

        if (request.IsExternalLogin)
        {
            var info = new UserLoginInfo(request.Provider, request.Email, request.Provider);
            result = await _userManager.AddLoginAsync(user, info);
            if (!result.Succeeded)
            {
                await _userManager.DeleteAsync(user);
                return GetFailureResponse(result);
            }
        }
        else
        {
            result = await _userManager.AddPasswordAsync(user, request.Password);
            if (!result.Succeeded)
            {
                await _userManager.DeleteAsync(user);
                return GetFailureResponse(result);
            }
        }

        result = await _userManager.SetEmailAsync(user, request.Email);
        if (!result.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            return GetFailureResponse(result);
        }

        // TODO: Send email confirmation link
        // var userId = await _userManager.GetUserIdAsync(user);
        // var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);

        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole(role));
        }
        await _userManager.AddToRoleAsync(user, role);
        return new AuthResponse();
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        if (_httpContextAccessor.HttpContext != null)
        {
            await _signInManager.SignOutAsync();
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            throw new InvalidOperationException("Account not found");
        }

        var result = SignInResult.Failed;
        if (request.IsExternalLogin)
        {
            result = await _signInManager.ExternalLoginSignInAsync(
                request.Provider,
                request.Email,
                isPersistent: true
            );
        }
        else
        {
            result = await _signInManager.PasswordSignInAsync(
                request.Email,
                request.Password,
                request.RememberMe,
                lockoutOnFailure: false
            );
        }

        if (result.Succeeded)
        {
            var tokenInfo = await _tokenService.GetUserTokensAsync(user);
            return new AuthResponse { Token = tokenInfo.AccessToken, RefreshToken = tokenInfo.RefreshToken };
        }

        _logger.LogError("User login failed with unexpected result: {result}", result.ToString());
        return new AuthResponse() { ErrorMessage = result.ToString() };
    }

    public async Task<AuthResponse> RefreshTokenAsync(TokenInfo tokenInfo)
    {
        var email = _tokenService.TryGetClaimFromExpiredToken(tokenInfo.AccessToken, ClaimTypes.Email);
        if (email == null)
        {
            return new AuthResponse { ErrorMessage = "Invalid token" };
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return new AuthResponse { ErrorMessage = "User not found" };
        }

        var isValidToken = _tokenService.ValidateRefreshToken(user, tokenInfo.RefreshToken);
        if (!isValidToken)
        {
            return new AuthResponse { ErrorMessage = "Invalid refresh token" };
        }

        return new AuthResponse
        {
            Token = _tokenService.GenerateAccessToken(user),
            RefreshToken = tokenInfo.RefreshToken,
        };
    }

    public async Task LogoutAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        await _tokenService.RevokeTokensAsync(user);
        await _signInManager.SignOutAsync();
    }

    private AppUser CreateUser(string email, string role)
    {
        try
        {
            var user = Activator.CreateInstance<AppUser>();
            user.Email = email;
            user.UserName = email;
            user.Role = role;
            user.EmailConfirmed = true;
            return user;
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

    private AuthResponse GetFailureResponse(IdentityResult result)
    {
        var errors = string.Join("\n", result.Errors.Select(err => err.Description));
        _logger.LogError("User registration failed: {errors}", errors);
        return new AuthResponse { ErrorMessage = errors };
    }
}
