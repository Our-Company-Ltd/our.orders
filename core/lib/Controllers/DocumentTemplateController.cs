using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
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
using Microsoft.Extensions.Logging;
using our.orders.Dtos;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Services;

namespace our.orders.Controllers
{
    /// <summary>
    /// <see cref="ServiceController"/> for the <see cref="DocumentTemplate"/> model using <see cref="DocumentTemplateDto"/> as dto
    /// </summary>
    [Authorize]
    [Route("[controller]")]
    internal class DocumentTemplateController : ServiceController<DocumentTemplate, DocumentTemplateDto>
    {
        public DocumentTemplateController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            IServiceProvider serviceProvider,
            ILoggerFactory loggerFactory,
            IService<DocumentTemplate> service
            ) : base(
                antiForgery,
                httpContextAccessor,
                env,
                mapper,
                appSettings,
                loggerFactory,
                serviceProvider,
                service)
        {
        }

        private class ProductLine
        {
            public string Title { get; set; }
            public int Count { get; set; }
            public string PrettyUnitPrice { get; set; }
            public string PrettyTotalPrice { get; set; }
            public string Sku { get; set; }

            public string OptionTitle { get; set; }
        };


        private class StocksBinding
        {
            public string Title { get; set; }
            public string SKU { get; set; }
            public int Stock { get; set; }
        };

        [HttpPost("{templateId}/order/{id?}")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> OrderAsync(
          [FromServices]IService<DocumentTemplate> templateService,
          [FromServices]IService<IOrder> orderService,
          [FromServices]IService<Shop> shopService,
          [FromRoute]string id,
          [FromRoute]string templateId,
          [FromBody]JsonPatchDocument<OrderDto> patch,
          CancellationToken cancellationToken = default(CancellationToken)
          )
        {

            var patched = _mapper.Map<JsonPatchDocument<IOrder>>(patch);
            var result = string.IsNullOrEmpty(id) ? await orderService.NewAsync(cancellationToken) : await orderService.GetByIdAsync(id, cancellationToken);

            patched.ApplyTo(result);

            var preview = await orderService.PreviewAsync(result);

            var template = await templateService.GetByIdAsync(templateId, cancellationToken);

            var compiled = Handlebars.Compile(template.Template);

            var prettyToday = DateTime.UtcNow.ToString("dd.MM.yyyy");

            // find the invoice template ?
            var shop = string.IsNullOrEmpty(preview.ShopId) ? null : await shopService.GetByIdAsync(preview.ShopId);

            var html = compiled(new { order = preview, shop = shop, today = prettyToday });

            return Ok(ApiModel.AsSuccess(new { html = html, styles = template.Styles }));
        }

        [HttpPost("{templateId}/client/{id}")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> ClientAsync(
          [FromServices]IService<DocumentTemplate> templateService,
          [FromServices]IService<Client> clientService,
          [FromRoute]string id,
          [FromRoute]string templateId,
          [FromBody]JsonPatchDocument<ClientDto> patch,
          CancellationToken cancellationToken = default(CancellationToken)
          )
        {

            var patched = _mapper.Map<JsonPatchDocument<Client>>(patch);
            var result = await clientService.GetByIdAsync(id, cancellationToken);

            patched.ApplyTo(result);

            var preview = await clientService.PreviewAsync(result);

            var template = await templateService.GetByIdAsync(templateId, cancellationToken);


            var compiled = Handlebars.Compile(template.Template);


            var html = compiled(new { client = preview });


            return Ok(ApiModel.AsSuccess(new { html = html, styles = template.Styles }));
        }

        [HttpPost("{templateId}/orders")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> OrdersAsync(
          [FromServices]IService<DocumentTemplate> templateService,
          [FromServices]IService<IOrder> orderService,
          [FromRoute]string templateId,
          [FromBody]Filter filter = null,
          string sort = null,
          CancellationToken cancellationToken = default(CancellationToken)
          )
        {
            var sorts = sort?.Split(',').Where(s => !string.IsNullOrEmpty(s));
            var result = await orderService.FindAsync(filter, sorts, null, cancellationToken);

            var template = await templateService.GetByIdAsync(templateId, cancellationToken);
            var compiled = Handlebars.Compile(template.Template);

            var html = compiled(new { orders = result.ToArray() });

            return Ok(ApiModel.AsSuccess(new { html = html, styles = template.Styles }));
        }

        [HttpPost("{templateId}/ordersProducts")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> OrdersProductsAsync(
          [FromServices]IService<DocumentTemplate> templateService,
          [FromServices]IService<IOrder> orderService,
          [FromRoute]string templateId,
          [FromBody]Filter filter = null,
          string sort = null,
          CancellationToken cancellationToken = default(CancellationToken)
          )
        {
            var sorts = sort?.Split(',').Where(s => !string.IsNullOrEmpty(s));
            var orders = await orderService.FindAsync(filter, sorts, null, cancellationToken);

            var itemsList = new List<OrderItem>();
            var groupedItems = new List<ProductLine>();

            foreach (var order in orders)
            {
                foreach (var item in order.Items)
                {
                    itemsList.Add(item);

                    if (item.Items != null && item.Items.Count() > 0)
                    {
                        foreach (var i in item.Items)
                        {
                            itemsList.Add(i);
                        }
                    }
                }
            }

            decimal taxAmount = 0;
            decimal totalAmount = 0;

            foreach (var item in itemsList)
            {
                taxAmount += item.Price.Tax;
                totalAmount += item.Price.Final * item.Quantity;
            }

            var productIdQuery = itemsList.GroupBy(
                item => item.ProductId
            );

            foreach (var resultGroup in productIdQuery)
            {
                if (string.IsNullOrEmpty(resultGroup.Key)) { continue; }

                var optionIdQuery = resultGroup.GroupBy(item => item.Option?.OptionId);

                foreach (var optionIdGroup in optionIdQuery)
                {
                    var quantity = 0;
                    foreach (var item in optionIdGroup)
                    {
                        quantity += item.Quantity;
                    }

                    var sample = optionIdGroup.FirstOrDefault();
                    var productLine = new ProductLine
                    {
                        Title = sample.Title,
                        Count = quantity,
                        PrettyUnitPrice = sample.PrettyUnitPrice,
                        PrettyTotalPrice = (sample.UnitPrice * quantity).ToString("0.00", CultureInfo.InvariantCulture),
                        Sku = sample.SKU,
                        OptionTitle = sample.Option?.Title
                    };

                    groupedItems.Add(productLine);
                }
            }

            var template = await templateService.GetByIdAsync(templateId, cancellationToken);
            var compiled = Handlebars.Compile(template.Template);

            var prettyToday = DateTime.UtcNow.ToString("dd.MM.yyyy");

            var html = compiled(new
            {
                Prodcuts = groupedItems.ToArray(),
                today = prettyToday,
                tax = taxAmount.ToString("0.00", CultureInfo.InvariantCulture),
                total = totalAmount.ToString("0.00", CultureInfo.InvariantCulture)
            });

            return Ok(ApiModel.AsSuccess(new { html = html, styles = template.Styles }));
        }

        [HttpPost("{templateId}/stocks/{id}/{min}/{max}")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> StocksAsync(
          [FromServices]IService<DocumentTemplate> templateService,
          [FromServices]IService<StockUnit> stocksService,
          [FromRoute]string templateId,
          [FromRoute]string id,
          [FromRoute]int min,
          [FromRoute]int max,
          [FromBody]Filter filter = null,
          string sort = null,
          CancellationToken cancellationToken = default(CancellationToken)
          )
        {
            var sorts = sort?.Split(',').Where(s => !string.IsNullOrEmpty(s));
            var result = await stocksService.FindAsync(filter, sorts, null, cancellationToken);

            var values = result.Where(s => s.Units.ContainsKey(id)).Select((i) => 
                new StocksBinding { Title = i.Detail, SKU = i.SKU, Stock = i.Units[id] });

            if (max >= 0)
            {
                values = values.Where(v => v.Stock <= max);
            }
            if (min >= 0)
            {
                values = values.Where(v => v.Stock >= min);
            }
            values = values.OrderBy(s => s.Stock);

            var template = await templateService.GetByIdAsync(templateId, cancellationToken);
            var compiled = Handlebars.Compile(template.Template);

            var html = compiled(new { stocks = values.ToArray() });

            return Ok(ApiModel.AsSuccess(new { html = html, styles = template.Styles }));
        }
    }

}