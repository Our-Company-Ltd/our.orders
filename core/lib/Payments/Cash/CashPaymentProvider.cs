using System;
using System.Collections.Generic;
using System.Linq;
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
using our.orders.Identity;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
namespace our.orders.Payments.Cash
{
    [Controller]
    [Route("cash")]
    [Authorize]
    public class CashPaymentProvider : BaseController, IPaymentProvider
    {
        private readonly OrderService orderService;
        private readonly Configuration configuration;
        private readonly IService<Movement> movementService;


        public CashPaymentProvider(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            OrderService orderService,
            Configuration configuration, 
            IRepository<Movement> movementProvider,
            IRepository<IShippingTemplate> shippingTemplateProvider,
            AppEvents appEvents) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {
            this.orderService = orderService;
            this.configuration = configuration;
            this.movementService = new Service<Movement>(movementProvider, appEvents);
        }

        public string Name => "cash";

        public class RegisterBindings
        {
            public string OrderID { get; set; }

            public string PaymentID { get; set; }

            public decimal Amount { get; set; }

            public decimal Change { get; set; }

            public string AmountCurrency { get; set; }
            public string ChangeCurrency { get; set; }


        }

        public class ChangeResponse
        {

            public IDictionary<string, decimal> Change { get; set; }

        }

        [HttpPost("change")]
        public async Task<IActionResult> GetChangeAsync([FromBody]RegisterBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await this.orderService.GetByIdAsync(bindings.OrderID, cancellationToken);
            var toPay = order.Total - order.PaidAmount;
            var rate = order.Currency == bindings.AmountCurrency ? 1 : configuration.GetRate(bindings.AmountCurrency, order.Currency);
            var amount = bindings.Amount * rate;
            var change = amount - toPay;

            return Ok(ApiModel.AsSuccess(
                change * configuration.GetRate(order.Currency, bindings.ChangeCurrency)
            ));
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromServices]UserManager userManager, [FromBody]RegisterBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await this.orderService.GetByIdAsync(bindings.OrderID, cancellationToken);

            var toPay = order.Total - order.PaidAmount;
            var rateAmount = order.Currency == bindings.AmountCurrency ? 1 : configuration.GetRate(bindings.AmountCurrency, order.Currency);
            var rateChange = order.Currency == bindings.ChangeCurrency ? 1 : configuration.GetRate(bindings.ChangeCurrency, order.Currency);
            var amount = bindings.Amount * rateAmount;
            var change = bindings.Change * rateChange;

            var payment = new Payment()
            {
                Title = "Cash Payment",
                Provider = Name,
                Reference = $"{User.Identity.Name}",
                Status = PaymentStatus.Paid,
                Date = DateTime.UtcNow,
                Method = PaymentMethod.Cash,
                Details = $"Payment Order #{order.Reference}",
                Currency = bindings.AmountCurrency,
                Amount = amount - change
            };

            var username = HttpContext.User.Identity.Name;
            if (string.IsNullOrEmpty(username)) return Ok(ApiModel.AsError<ChangeResponse>(null, "no user claims in request, did you forget to set the auth header ?"));

            var user = await userManager.FindByNameAsync(username);

            if (user == null) return Ok(ApiModel.AsError<ChangeResponse>(null, $"impossible to find a user with the username '{username}'"));

            await orderService.AddPayment(order, payment, cancellationToken);

            if (bindings.Change != 0)
            {
                await movementService.CreateAsync(new Movement()
                {
                    Currency = bindings.ChangeCurrency,
                    Amount = -1 * bindings.Change,
                    User = user.Preview(),
                    UserId = user.Id,
                    Date = DateTime.UtcNow,
                    ShopId = order.ShopId
                },
                cancellationToken);
            }

            if (bindings.Amount != 0)
            {
                await movementService.CreateAsync(new Movement()
                {
                    Currency = bindings.AmountCurrency,
                    Amount = bindings.Amount,
                    User = user.Preview(),
                    UserId = user.Id,
                    Date = DateTime.UtcNow,
                    ShopId = order.ShopId
                },
                cancellationToken);
            }


            return Ok(ApiModel.AsSuccess(
                payment
            ));
        }

        // [HttpPost("change")]
        // public async Task<IActionResult> RegisterChangeAsync([FromBody]RegisterBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        // {
        //     var order = await this.orderService.GetByIdAsync(bindings.OrderID, cancellationToken);


        //     var payment = order.Payments.FirstOrDefault(p => p.UID == bindings.PaymentID);

        //     if (payment == null) return Ok(ApiModel.AsError<RegisterResponse>(null, $"impossible to find a payment with the UID '{bindings.PaymentID}'"));

        //     // payment.Amount = 
        //     await orderService.AddPayment(order, payment, cancellationToken);

        //     return Ok(ApiModel.AsSuccess(payment));
        // }

    }
}