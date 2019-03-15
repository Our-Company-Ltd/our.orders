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
using Microsoft.Extensions.Logging;
using our.orders.Dtos;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Services;

namespace our.orders.Controllers
{
    [Authorize]
    [Route("[controller]")]
    internal class OrderItemController : BaseController
    {
        readonly ILogger<OrderItemController> _logger;
        readonly ProductService _productService;
        public OrderItemController(
          IAntiforgery antiForgery,
          IHttpContextAccessor httpContextAccessor,
          IHostingEnvironment env,
          IMapper mapper,
          IAppSettings appSettings,
          IServiceProvider serviceProvider,
          ILoggerFactory loggerFactory,
          ProductService productService
          ) : base(
              antiForgery,
              httpContextAccessor,
              env,
              mapper,
              appSettings)
        {
            _logger = loggerFactory.CreateLogger<OrderItemController>();
            _productService = productService;
        }

        public class PostBindings
        {
            public string Currency { get; set; }
            public ProductSelection[] Selections { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody]PostBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {

            var items = new List<OrderItem>();
            foreach (var selection in bindings.Selections)
            {
                var products = await _productService.FindAsync(Filter.Eq("UID", selection.ProductId), cancellationToken: cancellationToken);
                var product = products.FirstOrDefault();
                if (product == null) continue;
                var item = _productService.ToOrderItem(bindings.Currency, product, selection);

                var subitems = new List<OrderItem>();
                if (selection.Products != null)
                    foreach (var subSelection in selection.Products)
                    {
                        var subproduct = product.Products?.FirstOrDefault(p => p.UID == subSelection.ProductId);
                        if (subproduct == null) continue;


                        subitems.Add(_productService.ToOrderItem(bindings.Currency, subproduct, subSelection));

                    }

                item.SKU = item.Option != null && !string.IsNullOrEmpty(item.Option.SKU) ? item.Option.SKU : product.SKU;

                item.Items = subitems;
                items.Add(item);
            }
            return Ok(ApiModel.AsSuccess(items));

        }

    }

}