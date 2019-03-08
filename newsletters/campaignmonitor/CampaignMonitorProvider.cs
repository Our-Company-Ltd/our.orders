using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using createsend_dotnet;
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
namespace our.orders.Newsletter.CampaignMonitor
{
    [Controller]
    [Route("campaignmonitor")]
    [Authorize]
    public class CampaignMonitorProvider : BaseController, INewsletterProvider
    {
        private CampaignMonitorConfiguration configuration;
        public CampaignMonitorProvider(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            CampaignMonitorConfiguration configuration
            ) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {

            this.configuration = configuration;

        }

        public string Name => "campaignmonitor";



        [HttpPost("subscribe")]
        public Task<IActionResult> RegisterAsync([FromBody]SubscribeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var name = $"{bindings.FirstName ?? ""} {bindings.LastName ?? ""}";

            var auth = new ApiKeyAuthenticationDetails(this.configuration.ApiKey);

            new Subscriber(auth, this.configuration.ListId).Add(bindings.Email, name, null, true);

            return Task.FromResult((IActionResult)Ok(ApiModel.AsSuccess("ok")));
        }

    }
}