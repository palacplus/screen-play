using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ScreenPlay.Configuration;
using ScreenPlay.Dtos;
using ScreenPlay.Models;
using ScreenPlay.Services;

namespace ScreenPlay.Controllers;

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

    [HttpGet("user")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserAsync([FromQuery] string email)
    {
        var user = await _service.GetUserByEmailAsync(email);
        if (user == null)
        {
            _logger.LogError("User not found {email}", email);
            return NotFound("User not found");
        }
        return Ok(user);
    }

    [HttpDelete("user")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUserAsync([FromQuery] string email)
    {
        var user = await _service.GetUserByEmailAsync(email);
        if (user == null)
        {
            _logger.LogError("User not found {email}", email);
            return NotFound("User not found");
        }
        await _service.DeleteUserAsync(email);
        return Ok("User deleted successfully");
    }

    [HttpGet("external-info")]
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

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AppUser>> RegisterUserAsync([FromBody] LoginRequest request)
    {
        try
        {
            var response = await RegisterUserWithRoleAsync(request);
            if (response.Token == null)
            {
                return BadRequest(response.ErrorMessage);
            }
            return CreatedAtAction(nameof(RegisterUserAsync), response);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpPost("external-login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AppUser>> ExternalLoginAsync([FromBody] GoogleCallbackRequest request)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.Credential);
            var loginRequest = new ExternalLoginRequest(payload);

            _logger.LogInformation(loginRequest.IsExternalLogin.ToString());

            var user = await _service.GetUserByEmailAsync(loginRequest.Email);
            if (user != null)
            {
                var loginResponse = await _service.LoginAsync(loginRequest);
                if (loginResponse.Token == null)
                {
                    _logger.LogError("User not found {email}", loginRequest.Email);
                    return Unauthorized(loginResponse.ErrorMessage);
                }
                _logger.LogInformation("User logged in {email}", loginRequest.Email);
                return Ok(loginResponse);
            }

            var registerResponse = await RegisterUserWithRoleAsync(loginRequest);
            if (registerResponse.Token == null)
            {
                _logger.LogError("Unable to register external user {email}", loginRequest.Email);
                return BadRequest(registerResponse.ErrorMessage);
            }
            _logger.LogInformation("New User registered {email}", loginRequest.Email);
            return CreatedAtAction(nameof(ExternalLoginAsync), registerResponse);
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogError("Invalid JWT token: {error}", ex.Message);
            return BadRequest("Invalid JWT token");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
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
    public async Task<ActionResult<AuthResponse>> LoginAsync([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _service.LoginAsync(request);
            if (response.Token == null)
            {
                _logger.LogError("User not found {email}", request.Email);
                return Unauthorized(response.ErrorMessage);
            }
            _logger.LogInformation("User logged in {email}", request.Email);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpPost("refresh-token")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<AuthResponse>> RefreshTokenAsync(
        [FromBody] TokenRequest request,
        [FromHeader] string authorization
    )
    {
        try
        {
            if (authorization == null || authorization.StartsWith("Bearer ") == false)
            {
                return Unauthorized("Missing Bearer token");
            }
            var token = authorization.Substring("Bearer ".Length).Trim();
            var tokenInfo = new TokenInfo
            {
                AccessToken = token,
                RefreshToken = request.RefreshToken,
                Username = request.Email
            };
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
                return Unauthorized("User not found!");
            }
            await _service.LogoutAsync(principal.Value);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    private async Task<AuthResponse> RegisterUserWithRoleAsync(LoginRequest request)
    {
        if (request.Email == _adminEmail)
        {
            return await _service.RegisterAsync(request, AppRole.Admin);
        }
        else
        {
            return await _service.RegisterAsync(request, AppRole.User);
        }
    }
}
