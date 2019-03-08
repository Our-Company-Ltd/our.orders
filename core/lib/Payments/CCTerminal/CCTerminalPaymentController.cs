using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using our.orders.Controllers;
using our.orders.Helpers;
using our.orders.Services;
namespace our.orders.Payments.CCTerminal
{
    [Controller]
    [Route("ccterminal")]
    [Authorize]
    public class CCTerminalPaymentController : BaseController
    {
        public CCTerminalPaymentController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {
        }

        


        [HttpPost]
        public async Task<IActionResult> RegisterAsync([FromServices]CCTerminalPaymentProvider provider,[FromBody]CCTerminalChargeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await provider.ChargeAsync(bindings, cancellationToken);
            
            return Ok(ApiModel.AsSuccess(order));
        }

    }
}