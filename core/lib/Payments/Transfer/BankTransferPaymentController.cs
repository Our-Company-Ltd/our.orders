using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using HandlebarsDotNet;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using our.orders.Controllers;
using our.orders.Dtos;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Services;
namespace our.orders.Payments.BankTransfer
{
    [Controller]
    [Route("transfer")]
    [Authorize]
    public class BankTransferPaymentController : BaseController
    {
        public BankTransferPaymentController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {
        }

        [HttpPost]
        public async Task<IActionResult> RegisterAsync([FromServices]BankTransferPaymentProvider provider, [FromBody]BankTransferChargeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await provider.ChargeAsync(bindings, cancellationToken);

            return Ok(ApiModel.AsSuccess(order));
        }

        [HttpGet("message/{id}")]
        public async Task<IActionResult> GetMessage(
            [FromServices]BankTransferPaymentProvider provider,
            [FromServices]Configuration configuration,
            [FromServices]IService<IOrder> orderService,
            [FromRoute]string id,
            CancellationToken cancellationToken = default(CancellationToken)
            )
        {
            var result = await orderService.GetByIdAsync(id, cancellationToken);

            var preview = await orderService.PreviewAsync(result);
            var template = configuration.TransferMessage ?? "Default transfer message";

            var compiled = Handlebars.Compile(template);

            var html = compiled(new { order = preview });

            return Ok(ApiModel.AsSuccess(html));
        }

    }
}