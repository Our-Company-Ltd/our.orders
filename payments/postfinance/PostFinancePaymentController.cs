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

        public const string FORM_ACTION_PROD = "https://e-payment.postfinance.ch/ncol/prod/orderstandard.asp";
        public const string FORM_ACTION_TEST = "https://e-payment.postfinance.ch/ncol/test/orderstandard.asp";

        public class FromBindings
        {
            [Required]
            public string OrderID { get; set; }

            /// <summary>
            /// Amount to be paid
            /// </summary>
            /// <returns></returns>
            [Required]
            public decimal Amount { get; set; }


            public string RedirectUri { get; set; }

        }

        [HttpPost("form")]
        public async Task<IActionResult> FormAsync([FromServices]PostFinancePaymentProvider provider, [FromServices]PostFinanceConfiguration configuration, [FromServices]OrderService orderService, [FromBody]FromBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await orderService.GetByIdAsync(bindings.OrderID, cancellationToken);

            var message = new HttpResponseMessage();
            dynamic resp = new System.Dynamic.ExpandoObject();

            resp.method = "POST";

            resp.action = configuration.Sandbox ? FORM_ACTION_TEST : FORM_ACTION_PROD;
            var amount = bindings.Amount;
            var transactionUID = order.Reference + DateTime.Now.ToString("hh:mm:ss:ff").ShortMD5();
            // var payment = new Payment()
            // {
            //     Title = "PostFinance Payment",
            //     Provider = provider.Name,
            //     Reference = $"{transactionUID}",
            //     Status = PaymentStatus.Pending,
            //     Date = DateTime.UtcNow,
            //     Method = PaymentMethod.Electronic,
            //     Details = $"Payment Order #{order.Reference ?? order.Id}",
            //     Currency = order.Currency,
            //     Amount = amount,
            //     UID = transactionUID
            // };
            // await orderService.AddPayment(order, payment, cancellationToken);

            resp.amount = amount.ToString("0.00", CultureInfo.InvariantCulture);
            resp.txid = transactionUID;


            var formParams = new Dictionary<string, string>
                {
                    {"PSPID", configuration.PSPID },
                    {"orderID",  transactionUID},
                    {"amount", Math.Ceiling(amount * 100).ToString("0", CultureInfo.InvariantCulture)},
                    {"currency",  "CHF"},
                    {"language", "de" },
                    {"CN", (order.Client?.FirstName ?? "")+ " " + (order.Client?.LastName ?? "")},
                    {"EMAIL", order.Client?.Email ?? ""},
                    {"COM", configuration.COM},
                    { "PARAMPLUS", "ORDER=" + order.Id }
            };

            // if (PMLIST != null)
            //     formParams.Add("PMLIST", string.Join(";", PMLIST));
            // var redirectUri = bindings.RedirectUri;
            // formParams.Add("backurl", redirectUri + "/Orders/" + member.UserName + "#back");
            // formParams.Add("accepturl", redirectUri + "/Thanks/" + member.UserName);
            // formParams.Add("declineurl", redirectUri + "/Pay/" + member.UserName + "#decline");
            // formParams.Add("cancelurl", redirectUri + "/Pay/" + member.UserName + "#cancel");
            // formParams.Add("exceptionurl", redirectUri + "/Pay/" + member.UserName + "#exception");


            ////if (PARAMPLUS != null)
            //    formParams.Add("PARAMPLUS", PARAMPLUS(member));

            var strb = new StringBuilder();
            foreach (var kv in formParams.Where(kv => !string.IsNullOrEmpty(kv.Value as string)).OrderBy(k => k.Key))
            {
                strb.Append(kv.Key.ToUpperInvariant());
                strb.Append("=");
                strb.Append(formParams[kv.Key].ToString());
                strb.Append(configuration.SHASIGN);

            }

            var bytes = Encoding.UTF8.GetBytes(strb.ToString());
            var sha = new SHA1CryptoServiceProvider();
            var hashed = sha.ComputeHash(bytes);

            strb = new StringBuilder(hashed.Length * 2);
            foreach (byte b in hashed)
            {
                strb.Append(b.ToString("X2"));
            }

            formParams.Add("SHASIGN", strb.ToString());

            resp.param = formParams;


            message.Content = new StringContent(JsonConvert.SerializeObject(resp));
            message.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            return Ok(ApiModel.AsSuccess(resp));
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
        public async Task<HttpResponseMessage> PostFeedback([FromServices]PostFinancePaymentProvider provider, [FromServices]PostFinanceConfiguration configuration, [FromServices]OrderService orderService, [FromBody]PostFinanceFeedbackBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
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