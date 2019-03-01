using System;
using System.Threading;
using System.Threading.Tasks;
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
using our.orders.Statistics;

namespace our.orders.Controllers
{
    [Authorize]
    [Route("[controller]")]
    internal class PaymentController : BaseController
    {
        public PaymentController(IAntiforgery antiForgery, IHttpContextAccessor httpContextAccessor, IHostingEnvironment env, IMapper mapper, IAppSettings appSettings) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {

        }


        // public async Task<IActionResult> Charge(string id, string order, [FromBody]Payment payment)
        // {
        //     var customers = new StripeCustomerService();
        //     var charges = new StripeChargeService();
        //     order.PaymentID = "Stripe: " + id;
        //     _SaveInDB(order);

        //     var customer = customers.Create(new StripeCustomerCreateOptions
        //     {
        //         Email = order.Email,
        //         SourceToken = id
        //     });

        //     var charge = charges.Create(new StripeChargeCreateOptions
        //     {
        //         Amount = Convert.ToInt32(order.Amount * 100),
        //         Description = "The Backup Project",
        //         Currency = "eur",
        //         CustomerId = customer.Id
        //     });


        //     return Ok(ApiModel.AsSuccess(reports));
        // }


    }

}