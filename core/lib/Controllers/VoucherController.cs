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

namespace our.orders.Controllers
{
    [Authorize]
    [Route("[controller]")]
    internal class VoucherController : ServiceController<Voucher, VoucherDto>
    {

        public VoucherController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            IServiceProvider serviceProvider,
            ILoggerFactory loggerFactory,
            IService<Voucher> service,
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

        [HttpPost("find")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.LIST_VOUCHERS, RoleStore.CRUD_VOUCHERS)]
        public override Task<IActionResult> FindAsync([FromBody]Filter filter = null, string sort = null, string query = null, int start = 0, int take = 50, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.FindAsync(filter, sort, query, start, take, cancellationToken);
        }

        [HttpPost]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_VOUCHERS)]
        public override Task<IActionResult> PostAsync([FromBody]VoucherDto voucherDto, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PostAsync(voucherDto);
        }

        [HttpDelete("{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_VOUCHERS)]
        public override Task<IActionResult> DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.DeleteAsync(id);
        }

        [HttpPatch("{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_VOUCHERS)]
        public override Task<IActionResult> PatchAsync(string id, [FromBody]JsonPatchDocument<VoucherDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchAsync(id, patch);
        }

        [HttpPatch("empty")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_VOUCHERS)]
        public override Task<IActionResult> PatchEmptyAsync([FromBody]JsonPatchDocument<VoucherDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchEmptyAsync(patch);
        }

        [HttpPatch()]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_VOUCHERS)]
        public override Task<IActionResult> PatchAllAsync([FromBody]Dictionary<string, JsonPatchDocument<VoucherDto>> patches, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchAllAsync(patches);
        }

        [HttpPost("count")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_VOUCHERS)]
        public override Task<IActionResult> CountAsync([FromBody]Filter filter = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.CountAsync(filter, cancellationToken);
        }
    }

}