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
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using our.orders.Dtos;
using our.orders.Helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
using our.orders.Statistics;

namespace our.orders.Controllers
{
    [Authorize]
    [Route("[controller]")]
    internal class OrderController : ServiceController<IOrder, OrderDto>
    {
        private readonly UserManager userManager;

        public OrderController(
          UserManager userManager,
          IAntiforgery antiForgery,
          IHttpContextAccessor httpContextAccessor,
          IHostingEnvironment env,
          IMapper mapper,
          IAppSettings appSettings,
          IServiceProvider serviceProvider,
          ILoggerFactory loggerFactory,
          OrderService orderService,
          AppEvents appEvents
          ) : base(
              antiForgery,
              httpContextAccessor,
              env,
              mapper,
              appSettings,
              loggerFactory,
              serviceProvider,
              orderService)
        {

            this.orderService = orderService;
            this.userManager = userManager;
        }

        protected OrderService orderService { get; }

        [HttpPatch("preview")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public async Task<IActionResult> PreviewCreateAsync([FromBody]JsonPatchDocument<OrderDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var patched = _mapper.Map<JsonPatchDocument<IOrder>>(patch);
            var result = await service.NewAsync(cancellationToken);

            patched.ApplyTo(result);

            var preview = await orderService.PreviewAsync(result);

            return Ok(ApiModel.AsSuccess(result));
        }

        [HttpPatch("preview/{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public async Task<IActionResult> PreviewAsync(string id, [FromBody]JsonPatchDocument<OrderDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var patched = _mapper.Map<JsonPatchDocument<IOrder>>(patch);
            var result = await service.GetByIdAsync(id, cancellationToken);

            patched.ApplyTo(result);

            var preview = await orderService.PreviewAsync(result);

            return Ok(ApiModel.AsSuccess(result));

        }

        private async Task<User> _GetCurrentUserAsync()
        {
            var username = HttpContext.User.Identity.Name;
            if (string.IsNullOrEmpty(username)) return null;

            return await userManager.FindByNameAsync(username);
        }

        [HttpPatch("empty")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public override async Task<IActionResult> PatchEmptyAsync([FromBody]JsonPatchDocument<OrderDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var empty = await GetEmptyAsync(patch, cancellationToken);

            var user = await _GetCurrentUserAsync();
            empty.OrderType = OrderType.Order;
            empty.ShopId = user?.ShopId;
            empty.UserId = user?.Id;

            var dto = _mapper.Map<OrderDto>(empty);

            return Ok(ApiModel.AsSuccess(dto));
        }

        [HttpPost("shippings")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public async Task<IActionResult> ShippingsAsync([FromBody]OrderDto orderDto, int start = 0, int take = 50, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = _mapper.Map<IOrder>(orderDto);

            var preview = await orderService.PreviewAsync(order);


            var allTemplates = await orderService.GetShippingsAsync(preview, cancellationToken);
            var templates = allTemplates.Where(t => t.Accepts(preview));

            var count = templates.Count();
            var values = templates.Skip(start).Take(take).Select((i) => _mapper.Map<ShippingTemplateDto>(i));

            var listResult = new FindResult<ShippingTemplateDto>
            {
                Count = count,
                Start = start,
                Take = take,
                Values = values
            };

            var controllerName = nameof(OrderController).Replace("controller", "");

            var hasnext = count > (start + take);
            if (hasnext)
            {
                listResult.Next = Url.Action(
                  action: nameof(ShippingsAsync),
                  controller: controllerName,
                  values: new { orderDto = orderDto, start = start + take, take = take },
                  protocol: Request.Scheme,
                  host: Request.Host.Value);
            }
            var hasPrevious = start > 0;
            if (hasPrevious)
            {
                listResult.Previous = Url.Action(
                  action: nameof(ShippingsAsync),
                  controller: controllerName,
                  values: new { orderDto = orderDto, start = Math.Max(start - take, 0), take = Math.Min(start, take) },
                  protocol: Request.Scheme,
                  host: Request.Host.Value);
            }

            return Ok(ApiModel.AsSuccess(listResult));
        }

        [HttpPost]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_ORDERS, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public override async Task<IActionResult> PostAsync([FromBody]JsonPatchDocument<OrderDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (patch.Operations.Any(o => o.path == "UserId"))
            {
                var username = HttpContext.User.Identity.Name;
                if (string.IsNullOrEmpty(username)) return Ok(ApiModel.AsError<AccountDto>(null, "no user claims in request, did you forget to set the auth header ?"));

                var user = await userManager.FindByNameAsync(username);

                if (user == null) return Ok(ApiModel.AsError<AccountDto>(null, $"impossible to find a user with the username '{username}'"));
                patch.Add(m => m.UserId, user.Id);
            }

            return await base.PostAsync(patch, cancellationToken);
        }

        public class ReportRequest
        {

            public DateTime Start { get; set; }
            public int Count { get; set; }
            public TimeInterval TimeInterval { get; set; }
        }


        [HttpPost("reports/{eventType}/{dimension}")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.VIEW_DASHBOARD)]
        public async Task<IActionResult> Reports([FromRoute] StatisticEventType eventType, [FromRoute] StatisticEventDimension dimension, [FromBody]ReportRequest binding, CancellationToken cancellationToken = default(CancellationToken))
        {
            var reports = await orderService.GetStatsAsync(eventType, dimension, binding.Start, binding.Count, binding.TimeInterval, cancellationToken);

            return Ok(ApiModel.AsSuccess(reports));
        }


        [HttpPost("find")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.LIST_ORDERS, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public override Task<IActionResult> FindAsync([FromBody]Filter filter = null, string sort = null, string query = null, int start = 0, int take = 50, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.FindAsync(filter, sort, query, start, take, cancellationToken);

        }


        [HttpGet("{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public override Task<IActionResult> GetAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.GetAsync(id, cancellationToken);
        }

        [HttpDelete("{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public override Task<IActionResult> DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.DeleteAsync(id, cancellationToken);
        }

        [HttpPatch("{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public override Task<IActionResult> PatchAsync(string id, [FromBody]JsonPatchDocument<OrderDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchAsync(id, patch, cancellationToken);
        }

        [HttpPatch()]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public override Task<IActionResult> PatchAllAsync([FromBody]Dictionary<string, JsonPatchDocument<OrderDto>> patches, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchAllAsync(patches, cancellationToken);
        }
    }

}