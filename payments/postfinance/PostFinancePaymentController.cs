using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using our.orders.Controllers;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
using static our.orders.Payments.PostFinance.PostFinancePaymentProvider;

namespace our.orders.Payments.PostFinance
{
    [Controller]
    [Route("postfinance")]
    public partial class PostFinancePaymentController : BaseController
    {






        public PostFinancePaymentController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {

        }


        [HttpPost]
        public async Task<IActionResult> ChargeAsync([FromServices]PostFinancePaymentProvider provider, [FromBody]PostFinanceChargeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await provider.ChargeAsync(bindings, cancellationToken);

            return Ok(ApiModel.AsSuccess(order));


        }


    
        [HttpPost("form")]
        public async Task<IActionResult> FormAsync([FromServices]PostFinancePaymentProvider provider, [FromBody]PostFinanceFormBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var formResponse = await provider.GetFormAsync(bindings, cancellationToken);
            return Ok(ApiModel.AsSuccess(formResponse));
        }

        public class PostFinanceFeedbackBindings
        {
            public string orderID { get; set; }

            public string ORDER { get; set; }
            public string PM { get; set; }

            public decimal amount { get; set; }

            public int status { get; set; }
        }
        
        [HttpPost("feedback")]
        public async Task<HttpResponseMessage> PostFeedback([FromServices]PostFinancePaymentProvider provider, [FromServices]PostFinanceConfiguration configuration, [FromServices]OrderService orderService, [FromForm]PostFinanceFeedbackBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var message = new HttpResponseMessage();
            var paymentID = bindings.orderID;
            var orderId = bindings.ORDER;
            var amount = bindings.amount;
            var pm = bindings.PM;//obj.Get("PM");
            var infos = "";
            PaymentStatus finalStatus;


            var order = await orderService.GetByIdAsync(orderId, cancellationToken);

            var payment = order.Payments.FirstOrDefault(t => t.Id == paymentID);

            if (payment != null && payment.Status == PaymentStatus.Paid)
            {
                // already marked as paid
                return message;
            }


            //transaction.Details += ApiLogEntry.Create(controller, controller.OwinContext).ToJson();
            switch (bindings.status)
            {
                case 5:
                case 9:
                    finalStatus = PaymentStatus.Paid;
                    break;
                default:
                    finalStatus = PaymentStatus.Failed;
                    infos = $"transaction feedback status: {bindings.status} on {DateTime.UtcNow.ToShortDateString()} {DateTime.UtcNow.ToShortTimeString()} \n";
                    break;
            }

            if (payment == null)
            {
                payment = new Payment
                {
                    Title = "PostFinance Payment",
                    Provider = provider.Name,
                    Reference = $"{paymentID}",
                    Status = finalStatus,
                    Date = DateTime.UtcNow,
                    Method = PaymentMethod.Electronic,
                    Details = $"Payment Order #{order.Reference ?? order.Id} {infos}",
                    Currency = order.Currency,
                    Amount = amount,
                    Id = paymentID
                };
                await orderService.AddPayment(order, payment, cancellationToken);
            }
            else
            {
                payment.Status = finalStatus;
                payment.Details += infos;
                await orderService.UpdatePayment(order, payment, cancellationToken);

            }
            return message;
        }

    }


}