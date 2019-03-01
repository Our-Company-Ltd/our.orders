using System;
using Microsoft.AspNetCore.Mvc;


using AutoMapper;
using System.IdentityModel.Tokens.Jwt;

using Microsoft.Extensions.Options;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using our.orders.Dtos;
using our.orders.Helpers;
using our.orders.Identity;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using our.orders.Models;
using System.Net;
using our.orders.Services;
using System.Threading;
using System.Linq;
using Microsoft.AspNetCore.JsonPatch;
using System.Collections.Generic;
using HandlebarsDotNet;

namespace our.orders.Controllers
{
    [Authorize]
    internal abstract partial class ServiceController<TModel, TModelDto> : BaseController where TModel : class, IModel where TModelDto : class, IPreviewable
    {


        protected IService<TModel> service { get; }


        protected IServiceProvider serviceProvider  { get; }
        protected ILogger logger  { get; }


        public ServiceController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings,
            ILoggerFactory loggerFactory,
            IServiceProvider serviceProvider,
            IService<TModel> service
            ) : base(
                antiForgery,
                httpContextAccessor,
                env,
                mapper,
                appSettings)
        {
            this.service = service;
            this.serviceProvider = serviceProvider;
            logger = loggerFactory.CreateLogger<ServiceController<TModel, TModelDto>>();

        }

        [HttpPost]
        // [ValidateAntiForgeryToken]
        public virtual async Task<IActionResult> PostAsync([FromBody]TModelDto modelDto, CancellationToken cancellationToken = default(CancellationToken))
        {
            var model = _mapper.Map<TModel>(modelDto);

            var result = await service.CreateAsync(model, cancellationToken);

            var implementationType = this.GetType();
            var controllerName = implementationType.Name.ToLowerInvariant().Replace("controller", "");

            var entryUrl = Url.Action(
               action: nameof(GetAsync),
               controller: controllerName,
               values: new { id = result.Id },
               protocol: Request.Scheme,
               host: Request.Host.Value);

            return Created(entryUrl, ApiModel.AsSuccess(result));

        }


        [HttpGet("{id}")]
        // [ValidateAntiForgeryToken]
        public virtual async Task<IActionResult> GetAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            var result = await service.GetByIdAsync(id, cancellationToken);

            var model = _mapper.Map<TModelDto>(result);

            return Ok(ApiModel.AsSuccess(model));

        }

        [HttpDelete("{id}")]
        // [ValidateAntiForgeryToken]
        public virtual async Task<IActionResult> DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {


            await service.DeleteAsync(id, cancellationToken);

            return Ok(ApiModel.AsSuccess(id));

        }

        [HttpPatch("{id}")]
        // [ValidateAntiForgeryToken]
        public virtual async Task<IActionResult> PatchAsync(string id, [FromBody]JsonPatchDocument<TModelDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var patched = _mapper.Map<JsonPatchDocument<TModel>>(patch);
            var result = await service.GetByIdAsync(id, cancellationToken);

            patched.ApplyTo(result);

            await service.UpdateAsync(result, cancellationToken);
            var dto = _mapper.Map<TModelDto>(result);
            return Ok(ApiModel.AsSuccess(dto));

        }
        protected async Task<TModel> GetEmptyAsync([FromBody]JsonPatchDocument<TModelDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var patched = _mapper.Map<JsonPatchDocument<TModel>>(patch);
            var result = await service.NewAsync(cancellationToken);

            patched.ApplyTo(result);
            return result;
        }

        [HttpPatch("empty")]
        // [ValidateAntiForgeryToken]
        public virtual async Task<IActionResult> PatchEmptyAsync([FromBody]JsonPatchDocument<TModelDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            var empty = await GetEmptyAsync(patch, cancellationToken);

            var dto = _mapper.Map<TModelDto>(empty);
            return Ok(ApiModel.AsSuccess(dto));
        }

        [HttpPatch()]
        // [ValidateAntiForgeryToken]
        public virtual async Task<IActionResult> PatchAllAsync([FromBody]Dictionary<string, JsonPatchDocument<TModelDto>> patches, CancellationToken cancellationToken = default(CancellationToken))
        {
            var dtos = new List<TModelDto>();
            foreach (var patch in patches)
            {
                var patched = _mapper.Map<JsonPatchDocument<TModel>>(patch.Value);
                var result = await service.GetByIdAsync(patch.Key, cancellationToken);

                patched.ApplyTo(result);

                await service.UpdateAsync(result, cancellationToken);
                var dto = _mapper.Map<TModelDto>(result);
                dtos.Add(dto);
            }

            return Ok(ApiModel.AsSuccess(dtos));

        }

        [HttpPost("find")]
        // [ValidateAntiForgeryToken]
        public virtual async Task<IActionResult> FindAsync([FromBody]Filter filter = null, string sort = null, string query = null, int start = 0, int take = 50, CancellationToken cancellationToken = default(CancellationToken))
        {
            // TODO: absurd max and negative start should be validated in the modelstate
            var sorts = sort?.Split(',').Where(s => !string.IsNullOrEmpty(s));
            var result = await service.FindAsync(filter, sorts, query, cancellationToken);
            var count = result.Count();

            var implementationType = this.GetType();
            var controllerName = implementationType.Name.ToLowerInvariant().Replace("controller", "");

            var values = result.Skip(start).Take(take).Select((i) => _mapper.Map<TModelDto>(i));

            var listResult = new FindResult<TModelDto>
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
                  action: nameof(FindAsync),
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


        [HttpPost("count")]
        public virtual async Task<IActionResult> CountAsync([FromBody]Filter filter = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            // TODO: absurd max and negative start should be validated in the modelstate

            var result = await service.CountAsync(filter, cancellationToken);

            return Ok(ApiModel.AsSuccess(result));

        }


    }
}
