using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using our.orders.Controllers;
using our.orders.Helpers;

namespace our.orders.Payments.Paypal
{
    [Controller]
    [Route("paypal")]
    public class PayPalPaymentController : BaseController
    {
        

        public PayPalPaymentController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {

            

        }



        public class PaypalConfigurationBindings
        {
            public string sandbox { get; set; }
            public string production { get; set; }

            public string Environment { get; set; }
        }

        [HttpGet]
        public IActionResult Get([FromServices]PaypalConfiguration configuration)
        {
            return Ok(ApiModel.AsSuccess(new PaypalConfigurationBindings
            {
                sandbox = configuration.ClientIdSandbox,
                production = configuration.ClientIdProduction,
                Environment = configuration.Environment
            }));
        }


        [HttpPost()]
        public async Task<IActionResult> ChargeAsync([FromServices]PayPalPaymentProvider provider, [FromBody]PayPalChargeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                var order = await provider.ChargeAsync(bindings, cancellationToken);
                return Ok(ApiModel.AsSuccess(order.Payments));

            }
            catch (AppException AppException)
            {
                return Ok(ApiModel.AsError(AppException));
            }


        }

    }
}