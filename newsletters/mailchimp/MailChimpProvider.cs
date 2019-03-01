using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MailChimp.Net;
using MailChimp.Net.Models;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using our.orders.Controllers;
using our.orders.Helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Newsletter;
using our.orders.Repositories;
using our.orders.Services;
namespace our.orders.Newsletter.MailChimp
{
    [Controller]
    [Route("mailchimp")]
    [Authorize]
    public class MailChimpProvider : BaseController, INewsletterProvider
    {
        private MailChimpConfiguration configuration;
        public MailChimpProvider(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            MailChimpConfiguration configuration
            ) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {

            this.configuration = configuration;

        }

        public string Name => "mailchimp";



        [HttpPost("subscribe")]
        public async Task<IActionResult> RegisterAsync([FromBody]SubscribeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            
            // Use the Status property if updating an existing member
            var member = new Member { EmailAddress = bindings.Email, StatusIfNew = Status.Subscribed };
            member.MergeFields.Add("FNAME", bindings.FirstName);
            member.MergeFields.Add("LNAME", bindings.LastName);
            var manager = new MailChimpManager(this.configuration.ApiKey); //if you have it in code
            await manager.Members.AddOrUpdateAsync(this.configuration.ListId, member);
            
            return Ok(ApiModel.AsSuccess("ok"));
        }

    }
}