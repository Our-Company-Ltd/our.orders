using System;
using System.Collections.Generic;
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
    /// <summary>
    /// <see cref="ServiceController"/> for the <see cref="IClient"/> model using <see cref="ClientDto"/> as dto
    /// </summary>
    [Authorize]
    [Route("[controller]")]
    internal class ClientController : ServiceController<IClient, ClientDto>
    {
        public ClientController(
          IAntiforgery antiForgery,
          IHttpContextAccessor httpContextAccessor,
          IHostingEnvironment env,
          IMapper mapper,
          IAppSettings appSettings,
          IServiceProvider serviceProvider,
          ILoggerFactory loggerFactory,
          IRepository<IClient> clientProvider,
          AppEvents appEvents,
          IService<IClient> service
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

        [HttpPost]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_CLIENTS)]
        public override Task<IActionResult> PostAsync([FromBody]ClientDto modelDto, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PostAsync(modelDto, cancellationToken);
        }

        [HttpDelete("{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_CLIENTS)]
        public override Task<IActionResult> DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.DeleteAsync(id);

        }

        [HttpPatch("{id}")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_CLIENTS)]
        public override Task<IActionResult> PatchAsync(string id, [FromBody]JsonPatchDocument<ClientDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchAsync(id, patch);

        }

        [HttpPatch("empty")]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_CLIENTS)]
        public override Task<IActionResult> PatchEmptyAsync([FromBody]JsonPatchDocument<ClientDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchEmptyAsync(patch);
        }

        [HttpPatch()]
        // [ValidateAntiForgeryToken]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_CLIENTS)]
        public override Task<IActionResult> PatchAllAsync([FromBody]Dictionary<string, JsonPatchDocument<ClientDto>> patches, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PatchAllAsync(patches);
        }

        [HttpPost("count")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_CLIENTS)]
        public override Task<IActionResult> CountAsync([FromBody]Filter filter = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.CountAsync(filter, cancellationToken);
        }
    }
}