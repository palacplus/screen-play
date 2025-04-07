using System.Text;
using StreamSelect.Configuration;
using StreamSelect.Data;
using StreamSelect.Models;
using StreamSelect.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AuthDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// Authentication
builder
    .Services.AddIdentity<AppUser, IdentityRole>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders()
    .Services.AddIdentityServer()
    .AddApiAuthorization<AppUser, AuthDbContext>()
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
    .AddGoogle(googleOptions =>
    {
        var googleAuthConfig = builder
            .Configuration.GetSection(GoogleAuthConfiguration.ConfigSection)
            .Get<GoogleAuthConfiguration>();
        googleOptions.ClientId = googleAuthConfig.ClientId;
        googleOptions.ClientSecret = googleAuthConfig.ClientSecret;
        googleOptions.SignInScheme = IdentityConstants.ExternalScheme;
    });

builder.Services.AddControllersWithViews();
builder.Services.AddHttpContextAccessor();
builder.Services.AddRazorPages();

builder.Services.Configure<AdminConfiguration>(builder.Configuration.GetSection(AdminConfiguration.ConfigSection));
builder.Services.Configure<JwtConfiguration>(builder.Configuration.GetSection(JwtConfiguration.ConfigSection));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
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
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();
app.UseIdentityServer();
app.UseAuthorization();

app.MapControllerRoute(name: "default", pattern: "{controller}/{action=Index}/{id?}");
app.MapRazorPages();

app.MapFallbackToFile("index.html");

app.Run();
