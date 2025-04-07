using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using StreamSelect.Configuration;
using StreamSelect.Data;
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
    private readonly IUserStore<AppUser> _userStore;
    private readonly IUserEmailStore<AppUser> _emailStore;
    private readonly ILogger<AuthService> _logger;
    private readonly IEnumerable<AuthenticationScheme> _externalLogins;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly JwtConfiguration _jwtConfig;
    private readonly AuthDbContext _authDbContext;

    public AuthService(
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IUserStore<AppUser> userStore,
        SignInManager<AppUser> signInManager,
        ILogger<AuthService> logger,
        IHttpContextAccessor httpContextAccessor,
        JwtConfiguration jwtConfig,
        AuthDbContext authDbContext
    )
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _userStore = userStore;
        _emailStore = GetEmailStore();
        _signInManager = signInManager;
        _logger = logger;
        _externalLogins = _signInManager.GetExternalAuthenticationSchemesAsync().Result.ToList();
        _httpContextAccessor = httpContextAccessor;
        _jwtConfig = jwtConfig;
        _authDbContext = authDbContext;
    }

    public async Task<SignInResult> GetExternalInfoAsync()
    {
        var info = await _signInManager.PasswordSignInAsync("mpalacio123@gmail.com", "", isPersistent: false, false);
        return info;
    }

    public async Task<AppUser> RegisterAsync(LoginInfo loginInfo, string role)
    {
        var user = CreateUser();

        await _userStore.SetUserNameAsync(user, loginInfo.Email, CancellationToken.None);
        await _emailStore.SetEmailAsync(user, loginInfo.Email, CancellationToken.None);
        var result = await _userManager.CreateAsync(user, loginInfo.Password);

        if (result.Succeeded)
        {
            _logger.LogInformation("User created a new account with password.");

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
            return user;
        }
        _logger.LogError(result.Errors.ToString());
        return user;
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
            var token = GenerateEncodedToken(user);
            await _userManager.RemoveAuthenticationTokenAsync(user, string.Empty, "refresh_token");
            var refreshToken = GenerateRefreshToken();
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
        var principal = GetPrincipalFromExpiredToken(tokenInfo.AccessToken);
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
        var newAccessToken = GenerateEncodedToken(user);
        var newRefreshToken = GenerateRefreshToken();
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

    private IUserEmailStore<AppUser> GetEmailStore()
    {
        if (!_userManager.SupportsUserEmail)
        {
            throw new NotSupportedException("The default UI requires a user store with email support.");
        }
        return (IUserEmailStore<AppUser>)_userStore;
    }

    private string GenerateEncodedToken(AppUser user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user), "User cannot be null");
        }

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
        };

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpirationMinutes),
            IssuedAt = DateTime.UtcNow,
            SigningCredentials = credentials,
            Issuer = _jwtConfig.Issuer,
            Audience = _jwtConfig.Audience,
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];

        using var randomNumberGenerator = RandomNumberGenerator.Create();
        randomNumberGenerator.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal GetPrincipalFromExpiredToken(string accessToken)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidAudience = _jwtConfig.Audience,
            ValidIssuer = _jwtConfig.Issuer,
            ValidateLifetime = false,
            ClockSkew = TimeSpan.Zero,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Key)),
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        // Validate the token and extract the claims principal and the security token.
        var principal = tokenHandler.ValidateToken(
            accessToken,
            tokenValidationParameters,
            out SecurityToken securityToken
        );

        // Cast the security token to a JwtSecurityToken for further validation.
        var jwtSecurityToken = securityToken as JwtSecurityToken;

        // Ensure the token is a valid JWT and uses the HmacSha256 signing algorithm.
        // If no throw new SecurityTokenException
        if (
            jwtSecurityToken == null
            || !jwtSecurityToken.Header.Alg.Equals(
                SecurityAlgorithms.HmacSha256,
                StringComparison.InvariantCultureIgnoreCase
            )
        )
        {
            throw new SecurityTokenException("Invalid token");
        }

        // return the principal
        return principal;
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
