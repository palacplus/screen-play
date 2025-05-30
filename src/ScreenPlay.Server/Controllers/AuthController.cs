using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScreenPlay.Server.Dtos;
using ScreenPlay.Server.Models;
using ScreenPlay.Server.Services;

namespace ScreenPlay.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;
    private readonly IAuthService _service;

    public AuthController(ILogger<AuthController> logger, IAuthService service)
    {
        _logger = logger;
        _service = service;
    }

    [HttpGet("user")]
    [Authorize(Roles = AppRole.Admin)]
    [ProducesResponseType(typeof(IEnumerable<AppUser>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AppUser), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserAsync([FromQuery] string email="")
    {
        if (string.IsNullOrEmpty(email))
        {
            var users = await _service.GetAllUsersAsync();
            return Ok(users);
        }
        
        var user = await _service.GetUserByEmailAsync(email);
        if (user == null)
        {
            return NotFound("User not found");
        }
        return Ok(user);
    }

    [HttpDelete("user")]
    [Authorize(Roles = AppRole.Admin)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUserAsync([FromQuery] string email)
    {
        var user = await _service.GetUserByEmailAsync(email);
        if (user == null)
        {
            return NotFound("User not found");
        }
        await _service.DeleteUserAsync(email);
        return Ok("User deleted successfully");
    }

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AppUser>> RegisterUserAsync([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _service.RegisterAsync(request, AppRole.User);
            if (!string.IsNullOrEmpty(response.ErrorMessage))
            {
                return BadRequest(response.ErrorMessage);
            }

            try
            {
                response = await _service.LoginAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to login new user");
                await _service.DeleteUserAsync(request.Email);
                throw;
            }

            if (response.Token == null)
            {
                return BadRequest(response.ErrorMessage);
            }
            _logger.LogInformation("User registered {email}", request.Email);
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
    public async Task<ActionResult<AppUser>> ExternalLoginAsync([FromBody] GoogleCallbackRequest callBackRequest)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(callBackRequest.Credential);
            var request = new ExternalLoginRequest(payload);

            _logger.LogInformation("Processing external login with email {email}", request.Email);
            var user = await _service.GetUserByEmailAsync(request.Email);
            AuthResponse response = null;
            if (user != null)
            {
                try
                {
                    response = await _service.LoginAsync(request);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to login new user");
                    await _service.DeleteUserAsync(request.Email);
                    throw;
                }
            
                if (response.Token == null)
                {
                    return BadRequest(response.ErrorMessage);
                }
                _logger.LogInformation("User logged in {email}", request.Email);
                return Ok(response);
            }

            response = await _service.RegisterAsync(request, AppRole.User);
            try
            {
                response = await _service.LoginAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to login new user");
                await _service.DeleteUserAsync(request.Email);
                throw;
            }
            return CreatedAtAction(nameof(ExternalLoginAsync), response);
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
    [AllowAnonymous]
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
    [AllowAnonymous]
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
            var tokenInfo = new TokenInfo { AccessToken = token, RefreshToken = request.RefreshToken };
            var response = await _service.RefreshTokenAsync(tokenInfo);
            if (response.Token == null)
            {
                return Unauthorized(response.ErrorMessage);
            }
            _logger.LogInformation("User refreshed token {email}", request.Email);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpGet("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> LogoutAsync([FromQuery] string email)
    {
        try
        {
            await _service.LogoutAsync(email);
            _logger.LogInformation("User logged out {email}", email);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }
}
