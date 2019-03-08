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
using our.orders.Models;
using our.orders.Services;

namespace our.orders.Controllers
{
    [Authorize]
    [Route("[controller]")]
    internal class StockUnitController : ServiceController<StockUnit, StockUnitDto>
    {
        public StockUnitController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            IServiceProvider serviceProvider,
            ILoggerFactory loggerFactory,
            IService<StockUnit> service,
            AppEvents appEvents
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


        public class UpdateBindngs
        {
            public string SKU { get; set; }

            public Dictionary<string, int> Units { get; set; }

        }

        [HttpPatch("update")]
        public async Task<IActionResult> UpdateAsync([FromBody]UpdateBindngs bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var result = (await service.FindAsync(Filter.Eq("SKU", bindings.SKU), cancellationToken: cancellationToken)).FirstOrDefault();

            if (result == null)
            {
                result = new StockUnit { SKU = bindings.SKU, Units = bindings.Units };
                await service.CreateAsync(result, cancellationToken: cancellationToken);
            }
            else
            {
                result.Units = bindings.Units;
                await service.UpdateAsync(result, cancellationToken: cancellationToken);
            }
            return Ok(ApiModel.AsSuccess(result));

        }

        [HttpPost("use")]
        public async Task<IActionResult> UseStockAsync([FromBody]Dictionary<string, Dictionary<string, int>> bindings, CancellationToken cancellationToken = default(CancellationToken))
        {

            foreach (var sku in bindings.Keys)
            {
                var result = (await service.FindAsync(Filter.Eq("SKU", sku), cancellationToken: cancellationToken)).FirstOrDefault();
                var units = bindings[sku];
                if (result == null)
                {
                    result = new StockUnit
                    {
                        SKU = sku,
                        Units = units.ToDictionary(kvp => kvp.Key, kvp => -kvp.Value)
                    };
                    await service.CreateAsync(result, cancellationToken: cancellationToken);
                }
                else
                {
                    foreach (var warehouseId in units.Keys)
                    {
                        var stock = units[warehouseId];
                        if (!result.Units.ContainsKey(warehouseId)) result.Units.Add(warehouseId, 0);

                        result.Units[warehouseId] -= stock;
                    }

                    await service.UpdateAsync(result, cancellationToken: cancellationToken);
                }
            }

            return Ok(ApiModel.AsSuccess<StockUnit>(null));
        }

        public class WarehouseResponse
        {
            public string SKU { get; set; }

            public int Stock { get; set; }
        }

        [HttpPost("warehouse/{id}/{min}/{max}")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> WarehouseAsync([FromRoute]string id, [FromRoute]int min, [FromRoute]int max, [FromBody]Filter filter = null, int start = 0, int take = 50, CancellationToken cancellationToken = default(CancellationToken))
        {
            // TODO: absurd max and negative start should be validated in the modelstate
            var result = await service.FindAsync(filter, cancellationToken: cancellationToken);

            // we go link because of lack of support of 'in' opreator in Repository
            var values = result.Where(s => s.Units.ContainsKey(id)).Select((i) => new WarehouseResponse { SKU = i.SKU, Stock = i.Units[id] });
            if (max >= 0)
            {
                values = values.Where(v => v.Stock <= max);
            }
            if (min >= 0)
            {
                values = values.Where(v => v.Stock >= min);
            }

            var count = result.Count();

            var implementationType = this.GetType();
            var controllerName = implementationType.Name.ToLowerInvariant().Replace("controller", "");

            values = values.OrderBy(s => s.Stock).Skip(start).Take(take);

            var listResult = new FindResult<WarehouseResponse>
            {
                Count = count,
                Start = start,
                Take = take,
                Values = values
            };

            var hasnext = count > (start + take);
            if (hasnext)
            {
                listResult.Next = Url.Action(
                  action: nameof(WarehouseAsync),
                  controller: controllerName,
                  values: new { filter = filter, start = start + take, take = take },
                  protocol: Request.Scheme,
                  host: Request.Host.Value);
            }
            var hasPrevious = start > 0;
            if (hasPrevious)
            {
                listResult.Previous = Url.Action(
                  action: nameof(FindAsync),
                  controller: controllerName,
                  values: new { filter = filter, start = Math.Max(start - take, 0), take = Math.Min(start, take) },
                  protocol: Request.Scheme,
                  host: Request.Host.Value);
            }

            return Ok(ApiModel.AsSuccess(listResult));

        }
    }
}