using Microsoft.AspNetCore.Mvc;


using AutoMapper;
using our.orders.Helpers;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace our.orders.Controllers
{
    /// <summary>
    /// A base controller class with <see cref="IMapper"/>, <see cref="IAppSettings"/>, <see cref="IAntiforgery"/> and <see cref="IHostingEnvironment"/> references
    /// </summary>
    public abstract class BaseController : Controller
    {

        protected readonly IMapper _mapper;
        protected readonly IAppSettings _appSettings;

        protected readonly IAntiforgery _antiForgery;

        protected readonly IHostingEnvironment _env;

        public BaseController(
          IAntiforgery antiForgery,
          IHttpContextAccessor httpContextAccessor,
          IHostingEnvironment env,
          IMapper mapper,
          IAppSettings appSettings)
        {
            _mapper = mapper;
            _appSettings = appSettings;

            _antiForgery = antiForgery;
            _env = env;

        }
    }
}
