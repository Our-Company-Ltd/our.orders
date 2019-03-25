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
using our.orders.Services;

namespace our.orders.Controllers
{
    [Authorize]
    [Route("[controller]")]
    internal class MovementController : ServiceController<Movement, MovementDto>
    {
        private readonly UserManager userManager;

        public MovementController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            IServiceProvider serviceProvider,
            ILoggerFactory loggerFactory,
            AppEvents appEvents,
            UserManager userManager,
            IService<Movement> service
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

            this.userManager = userManager;
        }

        [HttpPost("find")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.VIEW_SHOPS_MOVEMENTS)]
        public override Task<IActionResult> FindAsync([FromBody]Filter filter = null, string sort = null, string query = null, int start = 0, int take = 50, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.FindAsync(filter, sort, query, start, take, cancellationToken);

        }

        [HttpGet("cashbox")]
        public async Task<IActionResult> CashboxAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var filter = Filter.Ne("Archived", true);

            var results = await service.FindAsync(filter, cancellationToken: cancellationToken);

            var cashbox = results
                    .Where(m => !string.IsNullOrEmpty(m.ShopId))
                    .GroupBy(m => m.ShopId)
                    .ToDictionary(
                        shop => shop.Key,
                        shop => shop.GroupBy(m => m.Currency).ToDictionary(
                            currency => currency.Key,
                            currency => currency.Sum(m => m.Amount)
                        )
                    );



            return Ok(ApiModel.AsSuccess(cashbox));

        }


        // public class FindMovementBindings
        // {
        //     public bool Archived { get; set; }


        //     public string Query { get; set; }

        //     public string Shop { get; set; }

        //     public DateTime FromDate { get; set; }

        //     public DateTime toDate { get; set; }

        // }

        // [HttpPost("findMovement")]
        // // [ValidateAntiForgeryToken]
        // public async Task<IActionResult> FindMovementAsync([FromBody]FindMovementBindings filter = null, string sort = null, int start = 0, int take = 50, CancellationToken cancellationToken = default(CancellationToken))
        // {
        //     var filters = new List<Filter>();

        //     if (!filter.Archived)
        //     {
        //         filters.Add(Filter.Eq("Archived", false));
        //     }

        //     if (!string.IsNullOrEmpty(filter.Shop))
        //     {
        //         filters.Add(Filter.Eq("ShopId", filter.Shop));
        //     }



        //     return await FindAsync(filters.Count > 0 ? Filter.And(filters.ToArray()) : null, sort, null, start, take, cancellationToken: cancellationToken);
        // }

        [HttpPost]
        // [ValidateAntiForgeryToken]
        public override async Task<IActionResult> PostAsync([FromBody]JsonPatchDocument<MovementDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var username = HttpContext.User.Identity.Name;
            if (string.IsNullOrEmpty(username)) return Ok(ApiModel.AsError<AccountDto>(null, "no user claims in request, did you forget to set the auth header ?"));

            var user = await userManager.FindByNameAsync(username);

            if (user == null) return Ok(ApiModel.AsError<AccountDto>(null, $"impossible to find a user with the username '{username}'"));
            patch.Add(m => m.UserId, user.Id);
            patch.Add(m => m.User, user.Preview());
            return await base.PostAsync(patch, cancellationToken);

        }

        [HttpPost("balance/{id}")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> BalanceAsync([FromRoute]string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            var username = HttpContext.User.Identity.Name;
            if (string.IsNullOrEmpty(username)) return Ok(ApiModel.AsError<AccountDto>(null, "no user claims in request, did you forget to set the auth header ?"));

            var user = await userManager.FindByNameAsync(username);

            if (user == null) return Ok(ApiModel.AsError<AccountDto>(null, $"impossible to find a user with the username '{username}'"));
            var filter = Filter.And(Filter.Eq("Archived", false), Filter.Eq("ShopId", id));
            var results = await service.FindAsync(filter, cancellationToken: cancellationToken);

            foreach (var group in results.GroupBy(m => m.Currency))
            {
                var amount = -group.Sum(m => m.Amount);
                if (amount == 0) continue;

                var result = await service.NewAsync(cancellationToken);
                result.UserId = user.Id;
                result.User = user.Preview();
                result.Currency = group.Key;
                result.ShopId = id;
                result.Amount = -group.Sum(m => m.Amount);
                result.Archived = true;
                await service.CreateAsync(result, cancellationToken);
                foreach (var m in group)
                {
                    m.Archived = true;
                    await service.UpdateAsync(m, cancellationToken);
                }
            }
            return Ok(ApiModel.AsSuccess(new { archived = results.Count() }));

        }

    }

}