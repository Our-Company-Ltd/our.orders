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

    /// <summary>
    /// <see cref="ServiceController"/> for the <see cref="Category"/> model using <see cref="CategoryDto"/> as dto
    /// </summary>
    [Authorize]
    [Route("[controller]")]
    internal class CategoryController : ServiceController<Category, CategoryDto>
    {
        public CategoryController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            IServiceProvider serviceProvider,
            ILoggerFactory loggerFactory,
            IService<Category> service,
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