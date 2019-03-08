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
using System.Threading;
using System.Linq;
using Microsoft.AspNetCore.JsonPatch;

namespace our.orders.Controllers
{
    [Authorize(Roles = RoleStore.ADMIN)]
    [Route("[controller]")]
    internal class UserController : BaseController
    {
        readonly UserManager _userManager;
        readonly SignInManager<User> _signInManager;
        readonly Guid _sessionId;
        readonly IServiceProvider _serviceProvider;
        readonly ILogger _logger;

        readonly IEmailSender _emailSender;
        public UserController(
            UserManager userManager,
            SignInManager<User> signInManager,
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



        [HttpGet("{id}")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> GetAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {

            var result = await _userManager.FindByIdAsync(id);

            var model = _mapper.Map<UserDto>(result);

            return Ok(ApiModel.AsSuccess(model));

        }

        [HttpGet()]
        // [ValidateAntiForgeryToken]
        public IActionResult GetAll(int start = 0, int take = 50, CancellationToken cancellationToken = default(CancellationToken))
        {
            var result = _userManager.Users;
            var count = result.Count();
            var values = result.Skip(start).Take(take).ToArray().Select((i) => _mapper.Map<UserDto>(i));

            var controllerName = nameof(UserController).ToLowerInvariant().Replace("controller", "");

            var listResult = new FindResult<UserDto>
            {
                Count = count,
                Start = start,
                Take = take,
                Values = values
            };

            var hasnext = count > (start + take);
            if (hasnext)
            {
                listResult.Next = Url.Action(
                  action: nameof(GetAll),
                  controller: controllerName,
                  values: new { start = start + take, take = take },
                  protocol: Request.Scheme,
                  host: Request.Host.Value);
            }
            var hasPrevious = start > 0;
            if (hasPrevious)
            {
                listResult.Previous = Url.Action(
                  action: nameof(GetAll),
                  controller: controllerName,
                  values: new { start = Math.Max(start - take, 0), take = Math.Min(start, take) },
                  protocol: Request.Scheme,
                  host: Request.Host.Value);
            }

            return Ok(ApiModel.AsSuccess(listResult));

        }
        [HttpPatch("{id}")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> PatchAsync(string id, [FromBody]JsonPatchDocument<UserDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var patched = _mapper.Map<JsonPatchDocument<User>>(patch);
            var result = await _userManager.FindByIdAsync(id);

            patched.ApplyTo(result);
            await _userManager.UpdateAsync(result);

            var dto = _mapper.Map<UserDto>(result);
            return Ok(ApiModel.AsSuccess(dto));

        }

        [HttpPatch()]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> PatchEmptyAsync([FromServices] User empty, [FromBody]JsonPatchDocument<UserDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var patched = _mapper.Map<JsonPatchDocument<User>>(patch);

            patched.ApplyTo(empty);
            await _userManager.CreateAsync(empty);

            var dto = _mapper.Map<UserDto>(empty);
            return Ok(ApiModel.AsSuccess(dto));

        }

        [HttpPost()]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> PostAsync([FromBody]UserDto userDto, [FromQuery]string password = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            var user = _mapper.Map<User>(userDto);

            if (string.IsNullOrEmpty(password))
                await _userManager.CreateAsync(user);
            else
                await _userManager.CreateAsync(user, password);


            var dto = _mapper.Map<UserDto>(user);
            return Ok(ApiModel.AsSuccess(dto));

        }

        [HttpPatch("empty")]
        // [ValidateAntiForgeryToken]
        public IActionResult PatchEmpty([FromServices] User empty, [FromBody]JsonPatchDocument<UserDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var dto = _mapper.Map<User>(empty);
            return Ok(ApiModel.AsSuccess(dto));
        }
        [HttpDelete("{id}")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken = default(CancellationToken))
        {

            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("user not found");

            var currentUserName = User.Identity.Name;
            var currentUser = await _userManager.FindByNameAsync(currentUserName);
            if (user.Id == currentUser.Id) return BadRequest("Can't delete yourself");

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(result);
            }

            return Ok();

        }
        public class ResetPasswordBindings
        {
            public string Id { get; set; }

            public string resetFormURL { get; set; }

            public bool email { get; set; }

        }
        public class ResetPasswordResult
        {
            public string Id { get; set; }
            public string Code { get; set; }

            public string Link { get; set; }

            public string Username { get; set; }

            public bool sent { get; set; }

        }
        [HttpPost("reset/{id}")]
        // [AllowAnonymous]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordBindings bindings)
        {
            var id = bindings.Id;
            var resetFormURL = bindings.resetFormURL ?? "";
            // TODO: validate model here or with a filter ?
            // TODO: do we really need the email confirmation ?
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) // || !(await _userManager.IsEmailConfirmedAsync(user))
            {
                _logger.LogWarning("Invalid forgot password attempt.");

                // Don't reveal that the user does not exist or is not confirmed
                return Ok(ApiModel.AsError<string>(null, "user does not exist"));

            }

            // For more information on how to enable account confirmation and password reset please
            // visit https://go.microsoft.com/fwlink/?LinkID=532713
            var code = await _userManager.GeneratePasswordResetTokenAsync(user);

            var values = new { id = user.Id, code = code };

            var callbackUrl = Url.Action(
                action: nameof(AccountController.ResetPassword),
                controller: nameof(AccountController).ToLowerInvariant().Replace("controller", ""),
                values: values,
                protocol: Request.Scheme,
                host: Request.Host.Value);

            var encodedCallback = WebUtility.UrlEncode(callbackUrl);
            var link = $"{resetFormURL}?action={encodedCallback}";
            var result = new ResetPasswordResult { Id = id, Code = code, Link = link, Username = user.UserName };

            result.sent = bindings.email && await _emailSender.SendEmailAsync(user.Email, "Reset Password",
               $"Please reset your password by clicking here: <a href='{link}'>link</a>");

            return Ok(ApiModel.AsSuccess<ResetPasswordResult>(result));
        }
    }
}
