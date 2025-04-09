using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using StreamSelect.Configuration;
using StreamSelect.Dtos;
using StreamSelect.Models;
using StreamSelect.Services;

namespace StreamSelect.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;
    private readonly IAuthService _service;
    private readonly string _adminEmail;

    public AuthController(
        ILogger<AuthController> logger,
        IAuthService service,
        IOptions<AdminConfiguration> adminOptions
    )
    {
        _logger = logger;
        _service = service;
        _adminEmail = adminOptions.Value.Email;
    }

    [HttpGet("externalInfo")]
    [Authorize(Roles = AppRole.Admin)]
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
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AppUser>> RegisterUserAsync([FromBody] LoginInfo loginInfo)
    {
        try
        {
            var response = await RegisterUserWithRoleAsync(loginInfo);
            if (response.Token == null)
            {
                _logger.LogError("User not found {email}", loginInfo.Email);
                return BadRequest(response.ErrorMessage);
            }

            _logger.LogInformation("New User registered {user}", loginInfo.Email);
            return CreatedAtAction(nameof(RegisterUserAsync), response);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
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
            var loginInfo = new LoginInfo(handler.ReadJwtToken(tokenResponse.Token));
            var response = await RegisterUserWithRoleAsync(loginInfo);
            if (response.Token == null)
            {
                _logger.LogError("User not found {email}", loginInfo.Email);
                return BadRequest(response.ErrorMessage);
            }
            _logger.LogInformation("New User registered {email}", loginInfo.Email);
            return CreatedAtAction(nameof(RegisterWithTokenAsync), response);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
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
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpPost("refreshToken")]
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
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpGet("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> LogoutAsync()
    {
        try
        {
            var principal = User.FindFirst(ClaimTypes.Email);
            if (principal == null)
            {
                return Unauthorized("User not found");
            }
            await _service.LogoutAsync(principal.Value);;
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    private async Task<AuthResponse> RegisterUserWithRoleAsync(LoginInfo LoginInfo)
    {
        if (LoginInfo.Email == _adminEmail)
        {
            return await _service.RegisterAsync(LoginInfo, AppRole.Admin);
        }
        else
        {
            return await _service.RegisterAsync(LoginInfo, AppRole.User);
        }
    }
}
