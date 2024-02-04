using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading;
using System.Threading.Tasks;
using Climax.Dtos;
using Climax.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
// using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;

namespace Climax.Services;

public class RegistrationService : IRegistrationService
{
    private readonly SignInManager<AppUser> _signInManager;
    private readonly UserManager<AppUser> _userManager;
    private readonly IUserStore<AppUser> _userStore;
    private readonly IUserEmailStore<AppUser> _emailStore;
    private readonly ILogger<RegistrationService> _logger;
    private readonly IEnumerable<AuthenticationScheme> _externalLogins;

    public RegistrationService(
        UserManager<AppUser> userManager,
        IUserStore<AppUser> userStore,
        SignInManager<AppUser> signInManager,
        ILogger<RegistrationService> logger
    )
    {
        _userManager = userManager;
        _userStore = userStore;
        _emailStore = GetEmailStore();
        _signInManager = signInManager;
        _logger = logger;
        _externalLogins = _signInManager.GetExternalAuthenticationSchemesAsync().Result.ToList();
    }

    public async Task<SignInResult> GetExternalInfoAsync()
    {
        var info = await _signInManager.PasswordSignInAsync("mpalacio123@gmail.com", "", isPersistent: false, false);
        return info;
    }

    public async Task<AppUser> RegisterUserAsync(NewUserInfo userInfo, string returnUrl = null)
    {
        var user = CreateUser();

        await _userStore.SetUserNameAsync(user, userInfo.Email, CancellationToken.None);
        await _emailStore.SetEmailAsync(user, userInfo.Email, CancellationToken.None);
        var result = await _userManager.CreateAsync(user, userInfo.Password);

        if (result.Succeeded)
        {
            _logger.LogInformation("User created a new account with password.");

            var userId = await _userManager.GetUserIdAsync(user);
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            // var callbackUrl = Url.Page(
            //     "/Account/ConfirmEmail",
            //     pageHandler: null,
            //     values: new
            //     {
            //         area = "Identity",
            //         userId = userId,
            //         code = code,
            //         returnUrl = returnUrl
            //     },
            //     protocol: Request.Scheme
            // );

            // await _emailSender.SendEmailAsync(
            //     dto.Email,
            //     "Confirm your email",
            //     $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>."
            // );

            await _signInManager.SignInAsync(user, isPersistent: false);
            return user;
        }
        _logger.LogError(result.Errors.ToString());
        return user;
    }

    private AppUser CreateUser()
    {
        try
        {
            return Activator.CreateInstance<AppUser>();
        }
        catch
        {
            throw new InvalidOperationException(
                $"Can't create an instance of '{nameof(AppUser)}'. "
                    + $"Ensure that '{nameof(AppUser)}' is not an abstract class and has a parameterless constructor, or alternatively "
                    + $"override the register page in /Areas/Identity/Pages/Account/Register.cshtml"
            );
        }
    }

    private IUserEmailStore<AppUser> GetEmailStore()
    {
        if (!_userManager.SupportsUserEmail)
        {
            throw new NotSupportedException("The default UI requires a user store with email support.");
        }
        return (IUserEmailStore<AppUser>)_userStore;
    }
}
