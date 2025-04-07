using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using StreamSelect.Configuration;
using StreamSelect.Controllers;
using StreamSelect.Dtos;
using StreamSelect.Models;
using StreamSelect.Services;

namespace StreamSelect.Tests.Controllers;

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
        var loginInfo = new LoginInfo() { Email = "user@example.com", Password = "password" };
        var appUser = new AppUser { Email = loginInfo.Email };
        _authService.RegisterAsync(loginInfo, UserRole.User).Returns(appUser);

        // Act
        var result = await _controller.RegisterUserAsync(loginInfo);

        // Assert
        var createdResult = result.Result as CreatedAtActionResult;
        createdResult.Should().NotBeNull();
        createdResult!.StatusCode.Should().Be(StatusCodes.Status201Created);
        createdResult.Value.Should().Be(appUser);
    }

    [Fact]
    public async Task RegisterUserAsync_ShouldReturnUnprocessableEntity_WhenRegistrationFails()
    {
        // Arrange
        var loginInfo = new LoginInfo { Email = "user@example.com", Password = "password" };
        _authService
            .RegisterAsync(loginInfo, UserRole.User)
            .Returns(Task.FromException<AppUser>(new Exception("Registration failed")));

        // Act
        var act = async () => await _controller.RegisterUserAsync(loginInfo);

        // Assert
        await act.Should().ThrowAsync<Exception>().WithMessage("Registration failed");
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnOk_WhenLoginIsSuccessful()
    {
        // Arrange
        var loginInfo = new LoginInfo { Email = "user@example.com", Password = "password" };
        var authResponse = new AuthResponse { Token = "sample-token" };
        _authService.LoginAsync(loginInfo).Returns(authResponse);

        // Act
        var result = await _controller.LoginAsync(loginInfo);

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
        var loginInfo = new LoginInfo { Email = "user@example.com", Password = "password" };
        var authResponse = new AuthResponse { Token = null, ErrorMessage = "Invalid credentials" };
        _authService.LoginAsync(loginInfo).Returns(authResponse);

        // Act
        var result = await _controller.LoginAsync(loginInfo);

        // Assert
        var unauthorizedResult = result.Result as UnauthorizedObjectResult;
        unauthorizedResult.Should().NotBeNull();
        unauthorizedResult!.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
        unauthorizedResult.Value.Should().Be(authResponse.ErrorMessage);
    }
}