using System.Configuration;
using Climax.Configuration;
using Climax.Data;
using Climax.Models;
using Climax.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AuthDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddDbContext<ClimaxDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder
    .Services.AddDefaultIdentity<AppUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<AuthDbContext>();

builder.Services.AddIdentityServer().AddApiAuthorization<AppUser, AuthDbContext>();

var googleAuthConfig = builder.Configuration.GetSection(GoogleAuthKeys.ConfigSection).Get<GoogleAuthKeys>();
builder
    .Services.AddAuthentication()
    .AddIdentityServerJwt()
    .AddGoogle(googleOptions =>
    {
        googleOptions.ClientId = googleAuthConfig.ClientId;
        googleOptions.ClientSecret = googleAuthConfig.ClientSecret;
        googleOptions.SignInScheme = IdentityConstants.ExternalScheme;
    });

builder.Services.AddControllersWithViews();
builder.Services.AddHttpContextAccessor();
builder.Services.AddRazorPages();

builder.Services.Configure<TransmissionOptions>(builder.Configuration.GetSection(TransmissionOptions.ConfigSection));
builder.Services.AddScoped<ITransmissionClient, TransmissionClient>();
builder.Services.AddScoped<IAccountManagementService, AccountManagementService>();
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
app.UseIdentityServer();
app.UseAuthorization();

app.MapControllerRoute(name: "default", pattern: "{controller}/{action=Index}/{id?}");
app.MapRazorPages();

app.MapFallbackToFile("index.html");

app.Run();
