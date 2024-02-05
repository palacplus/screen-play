using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Climax.Data;
using Climax.Dtos;
using Climax.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Climax.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly ILogger<AccountController> _logger;
    private readonly IAccountManagementService _service;

    public AccountController(ILogger<AccountController> logger, IAccountManagementService service)
    {
        _logger = logger;
        _service = service;
    }

    [HttpGet]
    [Route("externalInfo")]
    public async Task<ActionResult> Get()
    {
        var info = await _service.GetExternalInfoAsync();
        if (info == null)
        {
            _logger.LogInformation("yep");
        }
        return Ok(info);
    }

    [HttpPost]
    [Route("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Register([FromBody] NewUserInfo userInfo)
    {
        try
        {
            var user = await _service.RegisterUserAsync(userInfo);
            _logger.LogInformation("New User registered {user}", userInfo.Email);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return UnprocessableEntity();
        }
    }

    [HttpPost]
    [Route("register/token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> RegisterWithToken([FromBody] JwtTokenResponse tokenResponse)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(tokenResponse.Token);
            var userInfo = new NewUserInfo(token);
            var user = await _service.RegisterUserAsync(userInfo);
            _logger.LogInformation("New User registered {email}", userInfo.Email);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return UnprocessableEntity();
        }
    }

    [HttpPost]
    [Route("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Login([FromBody] UserInfo userInfo)
    {
        try
        {
            var user = await _service.LoginUserAsync(userInfo);
            if (user == null)
            {
                _logger.LogError("User not found {email}", userInfo.Email);
                return NotFound();
            }
            _logger.LogInformation("User logged in {email}", userInfo.Email);
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return UnprocessableEntity();
        }
    }

    [HttpGet]
    [Route("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> Logout()
    {
        try
        {
            await _service.LogoutUserAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return UnprocessableEntity();
        }
    }
}
