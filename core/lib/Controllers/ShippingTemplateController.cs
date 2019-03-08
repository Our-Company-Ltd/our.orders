using System;
using AutoMapper;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using our.orders.Dtos;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Services;

namespace our.orders.Controllers
{
    [Authorize]
    [Route("[controller]")]
    internal class ShippingTemplateController : ServiceController<IShippingTemplate, ShippingTemplateDto>
    {
        public ShippingTemplateController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            IServiceProvider serviceProvider,
            ILoggerFactory loggerFactory,
            IService<IShippingTemplate> service,
            AppEvents appEvents
            ) : base(
                antiForgery,
                httpContextAccessor,
                env,
                mapper,
                appSettings,
                loggerFactory,
                serviceProvider,
                service)
        {

            
        }
    }

}