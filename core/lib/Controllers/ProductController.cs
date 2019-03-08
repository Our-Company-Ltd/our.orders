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
    internal class ProductController : ServiceController<IProduct, ProductDto>
    {
        public ProductController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            IServiceProvider serviceProvider,
            ILoggerFactory loggerFactory,
            IService<IProduct> service,
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


        [HttpGet("previews")]
        public async Task<IActionResult> GetPreviewsAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var all = await service.FindAsync(cancellationToken: cancellationToken);
            return Ok(ApiModel.AsSuccess(all.Select(p => _mapper.Map<ProductPreviewDto>(p))));
        }

        [HttpPost]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_PRODUCTS)]
        public override Task<IActionResult> PostAsync([FromBody]ProductDto modelDto, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PostAsync(modelDto);
        }


        [HttpDelete("{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_PRODUCTS)]
        public override Task<IActionResult> DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.DeleteAsync(id);
        }

        [HttpPatch("{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_PRODUCTS)]
        public override Task<IActionResult> PatchAsync(string id, [FromBody]JsonPatchDocument<ProductDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchAsync(id, patch);
        }

        [HttpPatch("empty")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_PRODUCTS)]
        public override Task<IActionResult> PatchEmptyAsync([FromBody]JsonPatchDocument<ProductDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchEmptyAsync(patch);
        }

        [HttpPatch()]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_PRODUCTS)]
        public override Task<IActionResult> PatchAllAsync([FromBody]Dictionary<string, JsonPatchDocument<ProductDto>> patches, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchAllAsync(patches);
        }

        [HttpPost("count")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_PRODUCTS)]
        public override Task<IActionResult> CountAsync([FromBody]Filter filter = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.CountAsync(filter, cancellationToken);
        }
    }
}