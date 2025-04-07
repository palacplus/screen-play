using System.IdentityModel.Tokens.Jwt;
using StreamSelect.Configuration;
using StreamSelect.Dtos;
using StreamSelect.Models;
using StreamSelect.Services;
using Microsoft.AspNetCore.Mvc;

namespace StreamSelect.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;
    private readonly IAuthService _service;
    private readonly string _adminEmail;

    public AuthController(ILogger<AuthController> logger, IAuthService service, AdminConfiguration adminConfig)
    {
        _logger = logger;
        _service = service;
        _adminEmail = adminConfig.Email;
    }

    [HttpGet("externalInfo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetExternalInfoAsync()
    {
        var info = await _service.GetExternalInfoAsync();
        if (info == null)
        {
            _logger.LogInformation("Unable to get external info");
            return NotFound("Unable to get external info");
        }
        return Ok(info);
    }

    [HttpPost("register/user")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<AppUser>> RegisterUserAsync([FromBody] LoginInfo loginInfo)
    {
        try
        {
            var user = await RegisterUserWithRoleAsync(loginInfo);
            _logger.LogInformation("New User registered {user}", loginInfo.Email);
            return CreatedAtAction(nameof(RegisterUserAsync), user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return UnprocessableEntity();
        }
    }

    [HttpPost("register/token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<AppUser>> RegisterWithTokenAsync([FromBody] JwtTokenResponse tokenResponse)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var LoginInfo = new LoginInfo(handler.ReadJwtToken(tokenResponse.Token));
            var user = await RegisterUserWithRoleAsync(LoginInfo);
            _logger.LogInformation("New User registered {email}", LoginInfo.Email);
            return CreatedAtAction(nameof(RegisterWithTokenAsync), user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return UnprocessableEntity();
        }
    }

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<AuthResponse>> LoginAsync([FromBody] LoginInfo loginInfo)
    {
        try
        {
            var response = await _service.LoginAsync(loginInfo);
            if (response.Token == null)
            {
                _logger.LogError("User not found {email}", loginInfo.Email);
                return Unauthorized(response.ErrorMessage);
            }
            _logger.LogInformation("User logged in {email}", loginInfo.Email);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return UnprocessableEntity();
        }
    }

    [HttpPost("refresh-token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<AuthResponse>> RefreshTokenAsync([FromBody] TokenInfo tokenInfo)
    {
        try
        {
            var response = await _service.RefreshTokenAsync(tokenInfo);
            if (response.Token == null)
            {
                return Unauthorized(response.ErrorMessage);
            }
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token refresh failed");
            return UnprocessableEntity();
        }
    }

    [HttpGet("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> LogoutAsync()
    {
        try
        {
            await _service.LogoutAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return UnprocessableEntity();
        }
    }

    private async Task<AppUser> RegisterUserWithRoleAsync(LoginInfo LoginInfo)
    {
        if (LoginInfo.Email == _adminEmail)
        {
            return await _service.RegisterAsync(LoginInfo, UserRole.Admin);
        }
        else
        {
            return await _service.RegisterAsync(LoginInfo, UserRole.User);
        }
    }
}
