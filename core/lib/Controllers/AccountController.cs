using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;


using AutoMapper;
using System.IdentityModel.Tokens.Jwt;

using Microsoft.Extensions.Options;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using our.orders.Dtos;
using our.orders.Helpers;
using our.orders.Identity;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using our.orders.Models;
using System.Net;
using our.orders.Services;
using Microsoft.AspNetCore.JsonPatch;
using System.Threading;
using System.Linq;
using System.ComponentModel.DataAnnotations;

namespace our.orders.Controllers
{
    /// <summary>
    /// <see cref="BaseController"/> for the <see cref="User"/> used for account management (log, setup, register etc…)
    /// </summary>
    [Authorize]
    [Route("[controller]")]
    internal class AccountController : BaseController
    {
        readonly UserManager _userManager;
        readonly SignInManager<User> _signInManager;
        private readonly IRoleStore<Role> roleStore;
        readonly Guid _sessionId;
        readonly IServiceProvider _serviceProvider;
        readonly ILogger _logger;

        readonly IEmailSender _emailSender;
        public AccountController(
            UserManager userManager,
            SignInManager<User> signInManager,
            IRoleStore<Role> roleStore,
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IServiceProvider serviceProvider,
            IHostingEnvironment env,
            ILoggerFactory loggerFactory,
            IEmailSender emailSender,
            IMapper mapper,
            IAppSettings appSettings) : base(
                antiForgery,
                httpContextAccessor,
                env,
                mapper,
                appSettings)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            this.roleStore = roleStore;


            // this.cookie = cookie;
            _serviceProvider = serviceProvider;
            _emailSender = emailSender;


            _logger = loggerFactory.CreateLogger<AccountController>();

            string sessionCookie = httpContextAccessor.HttpContext.Request.Cookies["SESSION"];
            if (string.IsNullOrEmpty(sessionCookie) || !Guid.TryParse(sessionCookie, out _sessionId))
            {
                _sessionId = Guid.NewGuid();
                httpContextAccessor.HttpContext.Response.Cookies.Append("SESSION", _sessionId.ToString(), new CookieOptions { Expires = DateTimeOffset.UtcNow + TimeSpan.FromDays(365), HttpOnly = false, Secure = httpContextAccessor.HttpContext.Request.IsHttps });
            }
        }


        public class AuthenticateBindings
        {
            [Required]
            public string UserName { get; set; }

            [Required]
            public string Password { get; set; }

            public bool RememberMe { get; set; }
        }

        private async Task<string> _GenerateTokenAsync(User user)
        {

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_appSettings.JwtSecret);
            var roles = await _userManager.GetRolesAsync(user);
            var rolesClaims = roles.Select(r => new Claim(ClaimTypes.Role, r));

            var claims = new Claim[]
                {
                        new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                        new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),

                        new Claim(ClaimTypes.NameIdentifier,user.UserName ?? ""),
                        new Claim(ClaimTypes.Name,user.UserName)
                }.Concat(rolesClaims);


            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        [AllowAnonymous]
        [HttpPost("authenticate")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> AuthenticateAsync([FromBody]AuthenticateBindings userDto, string returnUrl = null)
        {
            var username = _userManager.NormalizeKey(userDto.UserName);

            var result = await _signInManager.PasswordSignInAsync(username,
            userDto.Password, userDto.RememberMe, lockoutOnFailure: false);

            if (result.Succeeded)
            {


                var user = await _userManager.FindByNameAsync(username);
                if (user == null)
                {
                    throw new AppException($"impossible to find the user {userDto.UserName} after successfull login using this username");
                }

                _logger.LogInformation("User logged in.");

                var resultDto = _mapper.Map<AccountDto>(user);
                resultDto.Token = await _GenerateTokenAsync(user);
                resultDto.IsAuthenticated = true;

                return Ok(ApiModel.AsSuccess(resultDto));
            }
            if (result.RequiresTwoFactor)
            {

                return RedirectToAction(nameof(LoginWith2fa), new { returnUrl, userDto.RememberMe });
            }
            if (result.IsLockedOut)
            {
                _logger.LogWarning("User account locked out.");

                return Ok(ApiModel.AsError(userDto, "User account locked out."));
            }
            else
            {
                ModelState.AddModelError(string.Empty, "Invalid login attempt.");
                return Ok(ApiModel.AsError(userDto, "Invalid login attempt."));
            }

        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> LoginWith2fa(bool rememberMe, string returnUrl = null)
        {
            // Ensure the user has gone through the username & password screen first
            var user = await _signInManager.GetTwoFactorAuthenticationUserAsync();

            if (user == null)
            {
                throw new ApplicationException($"Unable to load two-factor authentication user.");
            }
            throw new NotImplementedException();
            // var model = new LoginWith2faViewModel { RememberMe = rememberMe };
            // ViewData["ReturnUrl"] = returnUrl;

            // return View(model);
        }

        [HttpPost("logout")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out.");
            return Ok(ApiModel.AsSuccess<User>(null));
        }


        [HttpGet("current")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCurrentUserId()
        {
            if (!_userManager.Users.Any())
            {
                return Ok(ApiModel.AsError<string>("setup", "no users in DB"));
            }
            var username = HttpContext.User.Identity.Name;
            if (string.IsNullOrEmpty(username)) return Ok(ApiModel.AsError<AccountDto>(null, "no user claims in request, did you forget to set the auth header ?"));

            var user = await _userManager.FindByNameAsync(username);

            if (user == null) return Ok(ApiModel.AsError<AccountDto>(null, $"impossible to find a user with the username '{username}'"));

            var resultDto = _mapper.Map<AccountDto>(user);
            resultDto.IsAuthenticated = true;

            return Ok(ApiModel.AsSuccess(resultDto));
        }

        public class SetupBindings
        {
            [Required]
            public string UserName { get; set; }

            [Required]
            public string Password { get; set; }
            public JsonPatchDocument<UserDto> Patch { get; set; }
        }
        [HttpPost("setup")]
        [AllowAnonymous]
        public async Task<IActionResult> SetupAsync([FromServices] User user, [FromBody]SetupBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (_userManager.Users.Any())
            {
                return Ok(ApiModel.AsError<string>("setup", "setup only available when no users in DB"));
            }
            user.UserName = bindings.UserName;
            user.Roles = new string[] { RoleStore.ADMIN };
            if (bindings.Patch != null)
            {
                var patched = _mapper.Map<JsonPatchDocument<User>>(bindings.Patch);
                patched.ApplyTo(user);
            }


            var result = await _userManager.CreateAsync(user, bindings.Password);

            // TODO: do we have to log ? 
            return Ok(ApiModel.FromIdentityResult<UserDto>(result.Succeeded ? _mapper.Map<UserDto>(user) : null, result));
        }

        [HttpPost("register")]
        [AllowAnonymous]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register([FromBody]string email, [FromQuery]string registerFormURL = "")
        {
            // TODO: validate model here or with a filter ?
            // TODO: do we really need the email confirmation ?
            var user = await _userManager.FindByNameAsync(email);
            if (user != null) // || !(await _userManager.IsEmailConfirmedAsync(user))
            {
                _logger.LogWarning($"Invalid register attempt, user with email {email} already exists");

                return Ok(ApiModel.AsError<User>(null, "user with email {email} already exists"));

            }

            // For more information on how to enable account confirmation and password reset please
            // visit https://go.microsoft.com/fwlink/?LinkID=532713
            var code = await _userManager.GeneratePasswordResetTokenAsync(user);

            var callbackUrl = Url.Action(
                action: nameof(AccountController.ResetPassword),
                controller: nameof(AccountController).ToLowerInvariant().Replace("controller", ""),
                values: new { id = user.Id, code = code },
                protocol: Request.Scheme,
                host: Request.Host.Value);

            var encodedCallback = WebUtility.UrlEncode(callbackUrl);

            var sendResult = await _emailSender.SendEmailAsync(user.Email, "Register",
               $"Please register by clicking here: <a href='{registerFormURL}?action={encodedCallback}'>link</a>");
            if (sendResult)
                return Ok(ApiModel.AsSuccess<User>(null));
            else
                return Ok(ApiModel.AsError<User>(null, "impossible to send reset password link by email"));
        }

        // TODO: give a way to confirm email ?
        // [HttpGet]
        // [AllowAnonymous]
        // public async Task<IActionResult> ConfirmEmail(string userId, string code)
        // {
        //     if (userId == null || code == null)
        //     {
        //         return RedirectToAction(nameof(HomeController.Index), "Home");
        //     }
        //     var user = await _userManager.FindByIdAsync(userId);
        //     if (user == null)
        //     {
        //         throw new ApplicationException($"Unable to load user with ID '{userId}'.");
        //     }
        //     var result = await _userManager.ConfirmEmailAsync(user, code);
        //     return View(result.Succeeded ? "ConfirmEmail" : "Error");
        // }


        public class ForgotPasswordBindings
        {
            public string UserName { get; set; }
        }

        [HttpPost("forgot")]
        [AllowAnonymous]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword([FromBody]ForgotPasswordBindings bindings, [FromQuery]string resetFormURL = "")
        {
            // TODO: validate model here or with a filter ?
            // TODO: do we really need the email confirmation ?
            var user = await _userManager.FindByNameAsync(bindings.UserName);
            if (user == null) // || !(await _userManager.IsEmailConfirmedAsync(user))
            {
                _logger.LogWarning("Invalid forgot password attempt.");

                // Don't reveal that the user does not exist or is not confirmed
                return Ok(ApiModel.AsSuccess<UserDto>(null));

            }

            // For more information on how to enable account confirmation and password reset please
            // visit https://go.microsoft.com/fwlink/?LinkID=532713
            var code = await _userManager.GeneratePasswordResetTokenAsync(user);

            var callbackUrl = Url.Action(
                action: nameof(AccountController.ResetPassword),
                controller: nameof(AccountController).ToLowerInvariant().Replace("controller", ""),
                values: new { id = user.Id, code = code },
                protocol: Request.Scheme,
                host: Request.Host.Value);

            var encodedCallback = WebUtility.UrlEncode(callbackUrl);

            var sendResult = await _emailSender.SendEmailAsync(user.Email, "Reset Password",
               $"Please reset your password by clicking here: <a href='{resetFormURL}?action={encodedCallback}'>link</a>");
            if (sendResult)
                return Ok(ApiModel.AsSuccess<UserDto>(null));
            else
                return Ok(ApiModel.AsError<UserDto>(null, "impossible to send reset password link by email"));
        }

        public class ResetPasswordBindings
        {
            [Required]
            public string id { get; set; }

            [Required]
            public string code { get; set; }

            [Required]
            public string password { get; set; }
        }
        [HttpPost("reset")]
        [AllowAnonymous]
        public Task<IActionResult> ResetPasswordPost(
                    [FromBody]ResetPasswordBindings bindings
                )
        {
            return ResetPassword(bindings.id, bindings.code, bindings.password);
        }

        [HttpGet("reset")]
        [AllowAnonymous]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword(
            [FromQuery]string id,
            [FromQuery]string code,
            [FromQuery]string password
        )
        {
            // TODO: validate model here or with a filter ?

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("Invalid reset password attempt.");

                // Don't reveal that the user does not exist or is not confirmed
                return Ok(ApiModel.AsError<UserDto>(null));
            }

            var result = await _userManager.ResetPasswordAsync(user, code, password);
            return Ok(ApiModel.FromIdentityResult<UserDto>(result.Succeeded ? _mapper.Map<UserDto>(user) : null, result));
        }

        public class ChangePasswordBindings
        {
            public ChangePasswordBindings(string currentPassword, string newPassword)
            {
                this.currentPassword = currentPassword;
                this.newPassword = newPassword;

            }
            public string currentPassword { get; set; }
            public string newPassword { get; set; }
        }

        [HttpPost("changePassword")]
        [AllowAnonymous]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword([FromBody]ChangePasswordBindings bindings)
        {
            var username = HttpContext.User.Identity.Name;
            if (string.IsNullOrEmpty(username)) return Ok(ApiModel.AsError<AccountDto>(null, "no user claims in request, did you forget to set the auth header ?"));

            var user = await _userManager.FindByNameAsync(username);

            if (user == null) return Ok(ApiModel.AsError<AccountDto>(null, $"impossible to find a user with the username '{username}'"));

            var result = await _userManager.ChangePasswordAsync(user, bindings.currentPassword, bindings.newPassword);
            var userDto = _mapper.Map<AccountDto>(user);

            return Ok(ApiModel.FromIdentityResult<AccountDto>(userDto, result));
        }

        [HttpPatch()]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> PatchAsync([FromBody]JsonPatchDocument<UserDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var patched = _mapper.Map<JsonPatchDocument<User>>(patch);

            var username = HttpContext.User.Identity.Name;
            if (string.IsNullOrEmpty(username)) return Ok(ApiModel.AsError<AccountDto>(null, "no user claims in request, did you forget to set the auth header ?"));

            var user = await _userManager.FindByNameAsync(username);

            if (user == null) return Ok(ApiModel.AsError<AccountDto>(null, $"impossible to find a user with the username '{username}'"));

            patched.ApplyTo(user);
            await _userManager.UpdateAsync(user);

            var dto = _mapper.Map<UserDto>(user);
            return Ok(ApiModel.AsSuccess(dto));

        }

    }
}
