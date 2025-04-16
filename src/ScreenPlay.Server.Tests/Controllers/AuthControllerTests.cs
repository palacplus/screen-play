using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ScreenPlay.Configuration;
using ScreenPlay.Controllers;
using ScreenPlay.Dtos;
using ScreenPlay.Models;
using ScreenPlay.Services;

namespace ScreenPlay.Tests.Controllers;

public class AuthControllerTests
{
    private readonly ILogger<AuthController> _logger = Substitute.For<ILogger<AuthController>>();
    private readonly IAuthService _authService = Substitute.For<IAuthService>();
    private readonly IOptions<AdminConfiguration> _adminOptions = Options.Create(
        new AdminConfiguration { Email = "admin@example.com" }
    );
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _controller = new AuthController(_logger, _authService, _adminOptions);
    }

    [Fact]
    public async Task RegisterUserAsync_ShouldReturnCreated_WhenUserIsRegistered()
    {
        // Arrange
        var loginRequest = new LoginRequest() { Email = "user@example.com", Password = "password" };
        var authResponse = new AuthResponse { Token = "access-token"};
        _authService.RegisterAsync(loginRequest, AppRole.User).Returns(authResponse);

        // Act
        var result = await _controller.RegisterUserAsync(loginRequest);

        // Assert
        var createdResult = result.Result as CreatedAtActionResult;
        createdResult.Should().NotBeNull();
        createdResult!.StatusCode.Should().Be(StatusCodes.Status201Created);
        createdResult.Value.Should().Be(authResponse);
    }

    [Fact]
    public async Task RegisterUserAsync_ShouldReturnInternalError_WhenRegistrationFails()
    {
        // Arrange
        var loginRequest = new LoginRequest { Email = "user@example.com", Password = "password" };
        _authService
            .RegisterAsync(loginRequest, AppRole.User)
            .Returns(Task.FromException<AuthResponse>(new Exception("Registration failed")));

        // Act
        var result = await _controller.RegisterUserAsync(loginRequest);

        // Assert
        var objectResult = result.Result as ObjectResult;
        objectResult.Should().NotBeNull();
        objectResult!.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
        objectResult.Value.Should().Be("Registration failed");
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnOk_WhenLoginIsSuccessful()
    {
        // Arrange
        var loginRequest = new LoginRequest { Email = "user@example.com", Password = "password" };
        var authResponse = new AuthResponse { Token = "sample-token" };
        _authService.LoginAsync(loginRequest).Returns(authResponse);

        // Act
        var result = await _controller.LoginAsync(loginRequest);

        // Assert
        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        okResult.Value.Should().Be(authResponse);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnUnauthorized_WhenLoginFails()
    {
        // Arrange
        var loginRequest = new LoginRequest { Email = "user@example.com", Password = "password" };
        var authResponse = new AuthResponse { Token = null, ErrorMessage = "Invalid credentials" };
        _authService.LoginAsync(loginRequest).Returns(authResponse);

        // Act
        var result = await _controller.LoginAsync(loginRequest);

        // Assert
        var unauthorizedResult = result.Result as UnauthorizedObjectResult;
        unauthorizedResult.Should().NotBeNull();
        unauthorizedResult!.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
        unauthorizedResult.Value.Should().Be(authResponse.ErrorMessage);
    }
}