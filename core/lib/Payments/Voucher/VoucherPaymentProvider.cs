using System;
using System.ComponentModel.DataAnnotations;
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
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
namespace our.orders.Payments.Voucher
{
    [Controller]
    [Route("voucherpayment")]
    [Authorize]
    public class VoucherPaymentProvider : BaseController, IPaymentProvider
    {
        private readonly IService<Models.Voucher> voucherService;
        private readonly OrderService orderService;
        public VoucherPaymentProvider(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env, IMapper mapper,
            IAppSettings appSettings,
            IRepository<IOrder> orderProvider,
            IService<Models.Voucher> voucherService,
            OrderService orderService,
            AppEvents appEvents) : base(antiForgery, httpContextAccessor, env, mapper, appSettings)
        {
            this.voucherService = voucherService;
            this.orderService = orderService;

        }

        public string Name => "voucher";

        public class UseBindings
        {
            [Required]
            public string Code { get; set; }

            [Required]
            public string OrderId { get; set; }


        }

        [HttpPost("use")]
        public async Task<IActionResult> UseAsync(
            [FromBody]UseBindings bindings,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            // var currency = bindings.Currency ?? _appSettings.Currencies.FirstOrDefault();
            var orderId = bindings.OrderId;
            var code = bindings.Code;

            var order = await orderService.GetByIdAsync(orderId, cancellationToken);

            if (order == null)
            {
                return NotFound($"Order with id = {orderId} not found");
            }

            var voucher = (await voucherService.FindAsync(Filter.Eq("Code", code), cancellationToken: cancellationToken)).FirstOrDefault();

            if (voucher == null)
            {
                return NotFound($"Voucher with code = {code} not found");
            }

            if (voucher.Used)
            {
                return BadRequest($"Voucher with code = {code} already used");
            }

            if (voucher.Expired)
            {
                return BadRequest($"Voucher with code = {code} expired on {voucher.Expiration}");
            }

            var amount = Math.Min(voucher.Value, order.Total - order.PaidAmount);

            voucher.Value -= amount;
            voucher.Used = !voucher.MultipleUse || voucher.Value <= 0;
            voucher.OrderIds = voucher.OrderIds.Concat(new[] { orderId });

            await voucherService.UpdateAsync(voucher, cancellationToken);

            var payment = new Payment()
            {
                Title = "Voucher Payment",
                Provider = Name,
                Reference = $"voucher",
                Status = PaymentStatus.Paid,
                Date = DateTime.UtcNow,
                Method = PaymentMethod.Voucher,
                Details = $"Payment Order #{order.Reference}",
                Currency = voucher.Currency,
                Amount = amount
            };

            await orderService.AddPayment(order, payment, cancellationToken);

            return Ok(ApiModel.AsSuccess(payment));

        }

        public class ValidateResponse
        {
            public bool Result { get; set; }

            public string Reason { get; set; }
        }
        [HttpPost("validate")]
        public async Task<IActionResult> ValidateAsync(
            [FromServices] OrderService orderService,
            [FromServices] IService<Models.Voucher> voucherService,
            [FromBody]UseBindings bindings,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            // var currency = bindings.Currency ?? _appSettings.Currencies.FirstOrDefault();
            var orderId = bindings.OrderId;
            var code = bindings.Code;

            var order = await orderService.GetByIdAsync(orderId, cancellationToken);

            if (order == null)
            {
                return NotFound($"Order with id = {orderId} not found");
            }

            var voucher = (await voucherService.FindAsync(Filter.Eq("Code", code), cancellationToken: cancellationToken)).FirstOrDefault();

            if (voucher == null)
            {
                return Ok(ApiModel.AsSuccess(new ValidateResponse { Result = false, Reason = "notfound" }));
            }

            if (voucher.Used)
            {
                return Ok(ApiModel.AsSuccess(new ValidateResponse { Result = false, Reason = "used" }));
            }

            if (voucher.Expired)
            {
                return Ok(ApiModel.AsSuccess(new ValidateResponse { Result = false, Reason = "expired" }));
            }

            if (voucher.Value <= 0)
            {
                return Ok(ApiModel.AsSuccess(new ValidateResponse { Result = false, Reason = "empty" }));
            }


            return Ok(ApiModel.AsSuccess(new ValidateResponse { Result = true }));

        }
        // [HttpPost]
        // public async Task<IActionResult> RegisterAsync([FromBody]RegisterBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        // {

        //     var order = await this.orderService.GetByIdAsync(bindings.OrderID, cancellationToken);

        //     var payment = new Payment()
        //     {
        //         Title = "Voucher Payment",
        //         Provider = Name,
        //         Reference = $"{User.Identity.Name}",
        //         Status = PaymentStatus.Pending,
        //         Date = DateTime.UtcNow,
        //         Method = PaymentMethod.Electronic,
        //         Details = $"Voucher Payment",
        //         Currency = order.Currency,
        //         Amount = bindings.Amount
        //     };

        //     await orderService.AddPayment(order, payment, cancellationToken);

        //     return Ok(ApiModel.AsSuccess(payment));
        // }

    }
}