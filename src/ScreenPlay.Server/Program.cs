using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ScreenPlay.Server.Configuration;
using ScreenPlay.Server.Data;
using ScreenPlay.Server.Models;
using ScreenPlay.Server.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables(prefix: "SP_");
builder.Logging.ClearProviders().AddConsole();

// Database Connection
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// Configuration
builder.Services.BindAndValidateOnStart<AdminCredentials>(AdminCredentials.ConfigSection);
builder.Services.BindAndValidateOnStart<JwtConfiguration>(JwtConfiguration.ConfigSection);
builder.Services.BindAndValidateOnStart<GoogleAuthConfiguration>(GoogleAuthConfiguration.ConfigSection);
builder.Services.BindAndValidateOnStart<RadarrConfiguration>(RadarrConfiguration.ConfigSection);

// Authentication
builder
    // TODO: Enable RequiredConfirmedAccount
    .Services.AddIdentity<AppUser, IdentityRole>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders()
    .Services.AddIdentityServer()
    .AddApiAuthorization<AppUser, AppDbContext>()
    .Services.AddAuthentication(options =>
    {
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var jwtConfig = builder.Configuration.GetSection(JwtConfiguration.ConfigSection).Get<JwtConfiguration>();
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidAudience = jwtConfig.Audience,
            ValidIssuer = jwtConfig.Issuer,
            ClockSkew = TimeSpan.Zero,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig.Key)),
        };
    })
    .AddIdentityServerJwt()
    .AddGoogle(opts =>
    {
        var googleAuthConfig = builder
            .Configuration.GetSection(GoogleAuthConfiguration.ConfigSection)
            .Get<GoogleAuthConfiguration>();
        opts.ClientId = googleAuthConfig.ClientId;
        opts.ClientSecret = googleAuthConfig.ClientSecret;
        opts.SignInScheme = IdentityConstants.ExternalScheme;
        opts.SaveTokens = true;
    });

// API
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSwaggerGen();

// Other Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddHttpClient<IRadarrClient, RadarrClient>();
builder.Services.AddHostedService<MovieSyncService>();
builder.Services.AddHostedService<StartupService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = string.Empty;
    });
}
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();
app.UseIdentityServer();
app.UseAuthorization();

app.MapControllerRoute(name: "default", pattern: "{controller}/{action=Index}/{id?}");

app.Run();
