using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using our.orders.Dtos;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Newsletter;
using our.orders.Payments;
using our.orders.Services;
using our.orders.Statistics;

namespace our.orders.Controllers
{
    [Authorize]
    [Route("[controller]")]
    internal class SettingsController : BaseController
    {
        private readonly IEnumerable<IPaymentProvider> paymentProviders;
        private readonly IEnumerable<INewsletterProvider> newsletterProviders;
        private readonly Configuration configuration;

        public SettingsController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            IEnumerable<IPaymentProvider> paymentProviders,
            IEnumerable<INewsletterProvider> newsletterProviders,
            Configuration configuration
            ) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {
            this.paymentProviders = paymentProviders;
            this.newsletterProviders = newsletterProviders;
            this.configuration = configuration;
        }
        private Lazy<Assembly> _Assembly = new Lazy<Assembly>(() => typeof(SettingsController).Assembly);
        
        [HttpGet]
        public IActionResult Get()
        {

            var configurationDto = _mapper.Map<ConfigurationDto>(configuration);
            var assembly = _Assembly.Value;

            configurationDto.PaymentProviders = paymentProviders.Select(p => p.Name);
            configurationDto.NewsletterProviders = newsletterProviders.Select(p => p.Name);
            configurationDto.Path = _appSettings.Path;
            configurationDto.assemblyVersion = assembly.GetName().Version.ToString();
            configurationDto.fileVersion = FileVersionInfo.GetVersionInfo(assembly.Location).FileVersion;
            configurationDto.productVersion = FileVersionInfo.GetVersionInfo(assembly.Location).ProductVersion;
            return Ok(ApiModel.AsSuccess(configurationDto));
        }

        [HttpPatch]
        public async Task<IActionResult> PatchAsync([FromBody]JsonPatchDocument<ConfigurationDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var patched = _mapper.Map<JsonPatchDocument<Configuration>>(patch);
            // TODO: Check if we have to replace singleton ?

            patched.ApplyTo(configuration);

            var configPath = this._env.ContentRootFileProvider.GetFileInfo("our.orders.config");

            var serialized = JsonConvert.SerializeObject(configuration);
            // todo dettached worker ?
            await System.IO.File.WriteAllTextAsync(configPath.PhysicalPath, serialized, cancellationToken);

            return Get();
        }

    }

}