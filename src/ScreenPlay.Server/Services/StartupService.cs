using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ScreenPlay.Server.Configuration;
using ScreenPlay.Server.Data;

namespace ScreenPlay.Server.Services;

public class StartupService : IHostedService
{
    public readonly IServiceProvider _serviceProvider;
    private readonly ILogger<StartupService> _logger;
    public StartupService(IServiceProvider serviceProvider, ILogger<StartupService> logger)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        _logger.LogInformation("Applying database migrations...");
        await dbContext.Database.MigrateAsync(cancellationToken);
        _logger.LogInformation("Database migrations applied successfully.");

        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        var adminCredentials = scope.ServiceProvider.GetRequiredService<IOptions<AdminCredentials>>().Value;

        _logger.LogInformation("Initializing admin user...");
        await AdminUserInitializer.CreateAdminUser(authService, adminCredentials);
        _logger.LogInformation("Admin user initialization completed.");
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}