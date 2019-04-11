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
using our.orders.Identity;
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
        readonly UserManager _userManager;
        public DocumentTemplateController(
            UserManager userManager,
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
            _userManager = userManager;
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

        private class Categories
        {
            public string Id { get; set; }
            public string Legend { get; set; }
            public List<ProductLine> Items { get; set; } = new List<ProductLine>();
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
        private IEnumerable<OrderItem> _ToItemList(IEnumerable<IOrder> orders)
        {
            return
                orders
                    .SelectMany(o => o.Items.Concat(o.Items?.SelectMany(i => i.Items ?? Enumerable.Empty<OrderItem>()) ?? Enumerable.Empty<OrderItem>()))
                    .Where(o => !string.IsNullOrEmpty(o.ProductId));
        }

        private IEnumerable<ProductLine> _ToProductLines(IEnumerable<OrderItem> items)
        {
            var groupbyProductAndOptions = items.GroupBy(i => new { product = i.ProductId, option = i.Option?.OptionId ?? "" });
            foreach (var group in groupbyProductAndOptions)
            {
                var sample = group.FirstOrDefault();
                var quantity = group.Sum(i => i.Quantity);
                yield return new ProductLine
                {
                    Title = sample.Title,
                    Count = quantity,
                    PrettyUnitPrice = sample.PrettyUnitPrice,
                    PrettyTotalPrice = (sample.UnitPrice * quantity).ToString("0.00", CultureInfo.InvariantCulture),
                    Sku = sample.SKU,
                    OptionTitle = sample.Option?.Title
                };
            }
        }

        [HttpPost("{templateId}/ordersProducts")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> OrdersProductsAsync(
          [FromServices]IService<DocumentTemplate> templateService,
          [FromServices]IService<IOrder> orderService,
          [FromServices]IService<Shop> shopService,
          [FromServices]IService<Category> categoryService,
          [FromRoute]string templateId,
          [FromBody]Filter filter = null,
          string sort = null,
          CancellationToken cancellationToken = default(CancellationToken)
          )
        {
            var sorts = sort?.Split(',').Where(s => !string.IsNullOrEmpty(s));
            var orders = await orderService.FindAsync(filter, sorts, null, cancellationToken);

            var itemsList = _ToItemList(orders);
            var productLines = new
            {
                title = "all",
                products = _ToProductLines(itemsList),
                tax = itemsList.Sum(i => i.Price?.Tax ?? 0).ToString("0.00", CultureInfo.InvariantCulture),
                total = itemsList.Sum(i => (i.Price?.Final ?? 0) * i.Quantity).ToString("0.00", CultureInfo.InvariantCulture)
            };

            var categories = (await categoryService.FindAsync(cancellationToken: cancellationToken)).ToArray();

            var ordersPerCategory =
                categories.ToDictionary(c => c, c => itemsList.Where(o => o.Categories.Contains(c.Id)).ToArray());

            var categoriesProductLines = ordersPerCategory.Where(kvp => kvp.Value.Any()).Select(kvp => new
            {
                title = kvp.Key.Title,
                products = _ToProductLines(kvp.Value),
                tax = kvp.Value.Sum(i => i.Price?.Tax ?? 0).ToString("0.00", CultureInfo.InvariantCulture),
                total = kvp.Value.Sum(i => (i.Price?.Final ?? 0) * i.Quantity).ToString("0.00", CultureInfo.InvariantCulture)
            });

            var template = await templateService.GetByIdAsync(templateId, cancellationToken);
            var compiled = Handlebars.Compile(template.Template);

            var today = DateTime.UtcNow.ToString("dd.MM.yyyy");
            var printFilters = new List<Tuple<string, string>>();

            if (filter != null && filter.Children.Count() > 0)
            {
                foreach (var property in filter.Children)
                {
                    switch (property.Property)
                    {
                        case "Reference":
                            printFilters.Add(new Tuple<string, string>("Reference", property.Value.ToString()));
                            continue;

                        case "UserId":
                            var user = await _userManager.FindByIdAsync(property.Value.ToString());
                            if (user == null) continue;
                            printFilters.Add(new Tuple<string, string>("User", $"{user.Preview()}"));
                            continue;

                        case "ShopId":
                            var shop = await shopService.GetByIdAsync(property.Value.ToString());
                            if (shop == null) continue;
                            printFilters.Add(new Tuple<string, string>("Shop", shop.Name));
                            continue;

                        case "Date":
                            var date = (DateTime)property.Value;
                            if (date == default(DateTime)) continue;

                            switch (property.Operator)
                            {
                                case FilterOperator.gte:
                                    printFilters.Add(new Tuple<string, string>("From", date.ToString("dd.MM.yyyy")));
                                    continue;

                                case FilterOperator.lte:
                                    printFilters.Add(new Tuple<string, string>("To", date.ToString("dd.MM.yyyy")));
                                    continue;
                            }
                            continue;
                    }
                }
            }

            var html = compiled(new
            {
                global = productLines,
                categories = categoriesProductLines.ToArray(),
                today = today,
                printFilters = printFilters
            });

            return Ok(ApiModel.AsSuccess(new { html = html, styles = template.Styles }));
        }

        private string _TranslateMethod(PaymentMethod method)
        {
            switch (method)
            {
                case PaymentMethod.Cash:
                    return "Bar";
                case PaymentMethod.Electronic:
                    return "Elektronisch";
                case PaymentMethod.Voucher:
                    return "Gutschein";
                default:
                    return method.ToString();
            }
        }

        private IEnumerable<Object> _ToPaymentList(IEnumerable<IOrder> orders)
        {
            foreach (var order in orders)
            {
                yield return new
                {
                    Reference = order.Reference,
                    Payments = string.Join(", ", order.Payments.Where(p => p.Status == PaymentStatus.Paid).Select(p => _TranslateMethod(p.Method)).ToArray()),
                    PaidMount = order.PaidAmount.ToString("0.00", CultureInfo.InvariantCulture)
                };
            }
        }

        private string _TotalPerPaymentMethod(IEnumerable<Payment> payments, PaymentMethod method)
        {
            return payments
                    .Where(p => p.Method == method)
                    .Sum(p => p?.Amount ?? 0)
                    .ToString("0.00", CultureInfo.InvariantCulture);
        }

        [HttpPost("{templateId}/paidOrders")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> odersPaiedAsync(
          [FromServices]IService<DocumentTemplate> templateService,
          [FromServices]IService<IOrder> orderService,
          [FromServices]IService<Shop> shopService,
          [FromRoute]string templateId,
          [FromBody]Filter filter = null,
          string sort = null,
          CancellationToken cancellationToken = default(CancellationToken)
          )
        {
            var sorts = sort?.Split(',').Where(s => !string.IsNullOrEmpty(s));
            var orders = await orderService.FindAsync(filter, sorts, null, cancellationToken);

            //Orders that are paid
            var paidOrders = orders.Where(o => o.Paid == true);

            // Payments that are finished
            var finishPayments = paidOrders.SelectMany(o => o.Payments).Where(p => p.Status == PaymentStatus.Paid);

            // Calculate the total amount paid by payment method
            var electronicTotal = _TotalPerPaymentMethod(finishPayments, PaymentMethod.Electronic);
            var cashTotal = _TotalPerPaymentMethod(finishPayments, PaymentMethod.Cash);
            var voucherTotal = _TotalPerPaymentMethod(finishPayments, PaymentMethod.Voucher);

            //calculate tax and total of finished orders
            var tax = paidOrders.Sum(o => o?.Tax ?? 0).ToString("0.00", CultureInfo.InvariantCulture);
            var total = paidOrders.Sum(i => (i?.Price ?? 0)).ToString("0.00", CultureInfo.InvariantCulture);

            //Print active filters
            var printFilters = new List<Tuple<string, string>>();

            if (filter != null && filter.Children.Count() > 0)
            {
                foreach (var property in filter.Children)
                {
                    switch (property.Property)
                    {
                        case "Reference":
                            printFilters.Add(new Tuple<string, string>("Reference", property.Value.ToString()));
                            continue;

                        case "UserId":
                            var user = await _userManager.FindByIdAsync(property.Value.ToString());
                            if (user == null) continue;
                            printFilters.Add(new Tuple<string, string>("User", $"{user.Preview()}"));
                            continue;

                        case "ShopId":
                            var shop = await shopService.GetByIdAsync(property.Value.ToString());
                            if (shop == null) continue;
                            printFilters.Add(new Tuple<string, string>("Shop", shop.Name));
                            continue;

                        case "Date":
                            var date = (DateTime)property.Value;
                            if (date == default(DateTime)) continue;

                            switch (property.Operator)
                            {
                                case FilterOperator.gte:
                                    printFilters.Add(new Tuple<string, string>("From", date.ToString("dd.MM.yyyy")));
                                    continue;

                                case FilterOperator.lte:
                                    printFilters.Add(new Tuple<string, string>("To", date.ToString("dd.MM.yyyy")));
                                    continue;
                            }
                            continue;
                    }
                }
            }

            var template = await templateService.GetByIdAsync(templateId, cancellationToken);
            var compiled = Handlebars.Compile(template.Template);

            var today = DateTime.UtcNow.ToString("dd.MM.yyyy");

            var html = compiled(new
            {
                global = _ToPaymentList(paidOrders).ToArray(),
                electronicTotal = electronicTotal,
                cashTotal = cashTotal,
                voucherTotal = voucherTotal,
                tax = tax,
                total = total,
                today = today,
                printFilters = printFilters
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