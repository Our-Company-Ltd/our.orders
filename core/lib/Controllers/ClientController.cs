using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CsvHelper;
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
        public override Task<IActionResult> PostAsync([FromBody]JsonPatchDocument<ClientDto> patch, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.PostAsync(patch, cancellationToken);
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

        [HttpPost("find")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_CLIENTS, RoleStore.CRUD_ORDERS, RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_OWN_ORDERS)]
        public override Task<IActionResult> FindAsync([FromBody]Filter filter = null, string sort = null, string query = null, int start = 0, int take = 50, CancellationToken cancellationToken = default(CancellationToken))
        {
            return base.FindAsync(filter, sort, query, start, take, cancellationToken);

        }

        [HttpPost("import/csv")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_CLIENTS)]
        public async Task<IActionResult> ImportCsvAsync(CancellationToken cancellationToken = default(CancellationToken))
        {

            var results = new List<ClientDto>();
            var headers = Request.Form.Where(p => p.Key == "headers").Select(p => p.Value.FirstOrDefault()).FirstOrDefault()?.DeSerialize<Dictionary<string, int>>();
            var delimiter = Request.Form.Where(p => p.Key == "delimiter").Select(p => p.Value.FirstOrDefault()).FirstOrDefault()?.DeSerialize<string>();
            var hasHeaderRecord = Request.Form.Where(p => p.Key == "hasHeaderRecord").Select(p => p.Value.FirstOrDefault())?.FirstOrDefault().DeSerialize<bool>();
            foreach (var file in Request.Form.Files)
            {
                if (file.Length <= 0 || file.FileName == null) continue;
                using (var stream = file.OpenReadStream())
                using (var reader = new StreamReader(stream))
                using (var csv = new CsvReader(reader))
                {
                    // we can and will miss fields 
                    csv.Configuration.MissingFieldFound = null;
                    // csv.Configuration.Encoding = new System.Text.UTF8Encoding();
                    csv.Configuration.Delimiter = delimiter ?? ",";
                    csv.Configuration.HasHeaderRecord = hasHeaderRecord ?? true;

                    if (headers != null)
                    {
                        var map = new CsvHelper.Configuration.DefaultClassMap<ClientDto>();
                        var clientType = typeof(ClientDto);
                        foreach (var memberName in headers.Keys)
                        {
                            var member = clientType.GetMember(memberName).FirstOrDefault();
                            if(member == null) continue;
                            map.Map(typeof(ClientDto),member).Index(headers[memberName]);
                        }
                        csv.Configuration.RegisterClassMap(map);
                        // csv.Configuration.PrepareHeaderForMatch = (string header, int index) => string.IsNullOrWhiteSpace(headers[index]) ? header : headers[index];
                    }
                    var records = csv.GetRecords<ClientDto>();
                    foreach (var clientDto in records)
                    {
                        var record = _mapper.Map<IClient>(clientDto);
                        var newClient = await service.CreateAsync(record, cancellationToken);
                        results.Add(_mapper.Map<ClientDto>(newClient));
                    }
                }
            }
            return Ok(ApiModel.AsSuccess(results));

        }

        [HttpPost("export/csv")]
        [AuthorizeRoles(RoleStore.ADMIN, RoleStore.CRUD_CLIENTS)]
        public async Task<IActionResult> ExportCsvAsync([FromBody]Filter filter = null, [FromQuery]string sort = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            var sorts = sort?.Split(',').Where(s => !string.IsNullOrEmpty(s));
            var results = await service.FindAsync(filter, sorts, cancellationToken: cancellationToken);


            var implementationType = this.GetType();
            var controllerName = implementationType.Name.ToLowerInvariant().Replace("controller", "");

            var dtos = results.Select(r => _mapper.Map<ClientDto>(r));
            var csvString = "";
            using (var writer = new StringWriter())
            using (var csv = new CsvWriter(writer))
            {
                csv.WriteRecords(dtos);
                csvString = writer.ToString();
            }

            return Ok(ApiModel.AsSuccess(csvString));

        }
    }
}