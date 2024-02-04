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
    private readonly IRegistrationService _registration;

    public AccountController(ILogger<AccountController> logger, IRegistrationService registrationService)
    {
        _logger = logger;
        _registration = registrationService;
    }

    [HttpGet]
    [Route("externalInfo")]
    public async Task<ActionResult> Get()
    {
        var info = await _registration.GetExternalInfoAsync();
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
    public async Task<ActionResult> Post([FromBody] NewUserInfo userInfo)
    {
        try
        {
            var user = await _registration.RegisterUserAsync(userInfo);
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
    public async Task<ActionResult> Post([FromBody] JwtTokenResponse tokenResponse)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(tokenResponse.Token);
            var userInfo = new NewUserInfo(token);
            var user = await _registration.RegisterUserAsync(userInfo);
            _logger.LogInformation("New User registered {user}", userInfo.Email);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return UnprocessableEntity();
        }
    }
}
