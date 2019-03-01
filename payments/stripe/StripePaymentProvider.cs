using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using our.orders.Controllers;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
using Stripe;
namespace our.orders.Payments.Stripe
{
    [Controller]
    [Route("stripe")]
    public class StripePaymentProvider : BaseController, IPaymentProvider
    {
        private readonly OrderService orderService;
        
        public StripePaymentProvider(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            OrderService orderService,
            IRepository<IShippingTemplate> shippingTemplateProvider,
            AppEvents appEvents) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {
            
            this.orderService = orderService;

        }

        public string Name => "stripe";

        public class ChargeBindings
        {
            public string OrderID { get; set; }

            public decimal Amount { get; set; }

            public string Token { get; set; }

        }

        [HttpGet]
        public IActionResult Get([FromServices]StripeConfiguration configuration)
        {
            return Ok(ApiModel.AsSuccess(configuration.PublishableKey));

        }

        [HttpPost]
        public async Task<IActionResult> ChargeAsync([FromServices]StripeConfiguration configuration, [FromBody]ChargeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await this.orderService.GetByIdAsync(bindings.OrderID, cancellationToken);

            var requestOptions = new StripeRequestOptions { ApiKey = configuration.SecretKey };

            var customers = new StripeCustomerService();
            var charges = new StripeChargeService();
            var payment = new Payment()
            {
                Title = "Stripe Payment",
                Provider = Name,
                Reference = $"{bindings.Token}",
                Status = PaymentStatus.Paid,
                Date = DateTime.UtcNow,
                Method = PaymentMethod.Electronic,
                Details = $"Payment Order #{order.Reference}",
                Currency = order.Currency,
                Amount = bindings.Amount
            };


            var customer = await customers.CreateAsync(new StripeCustomerCreateOptions
            {
                SourceToken = bindings.Token
            }, requestOptions, cancellationToken: cancellationToken);



            var charge = await charges.CreateAsync(new StripeChargeCreateOptions
            {
                Amount = Convert.ToInt32(payment.Amount * 100),
                Description = payment.Details,
                Currency = payment.Currency,
                CustomerId = customer.Id
            }, requestOptions, cancellationToken: cancellationToken);

            await orderService.AddPayment(order, payment, cancellationToken);

            return Ok(ApiModel.AsSuccess(order));
        }

    }
}