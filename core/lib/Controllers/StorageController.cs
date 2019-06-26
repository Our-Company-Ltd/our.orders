using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
    internal class StorageController : BaseController
    {
        public StorageController(
            IAntiforgery antiForgery,
            IHttpContextAccessor httpContextAccessor,
            IHostingEnvironment env,
            IMapper mapper,
            IAppSettings appSettings
        ) : base(
            antiForgery,
            httpContextAccessor,
            env,
            mapper,
            appSettings)
        {
        }

        [HttpPost]
        public async Task<IActionResult> UploadAsync()
        {

            var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            var uploadPath = Path.Combine(_appSettings.Path.Trim(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
            , _appSettings.DefaultUploadPath.Trim(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));

            // full path to file in temp location
            var result = new Dictionary<string, string>();
            foreach (var file in Request.Form.Files)
            {
                if (file.Length <= 0 || file.FileName == null) continue;
                var name = Path.GetFileNameWithoutExtension(file.FileName).RemoveDiacritics();
                var ext = Path.GetExtension(file.FileName);
                var filepath = Path.Combine(uploadPath, name + ext).Trim(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

                var localpath = Path.Combine(wwwroot.TrimEnd('/'), filepath);
                localpath = Path.GetFullPath((new Uri(localpath)).LocalPath);

                var localdirectory = Path.GetDirectoryName(localpath);
                if (!Directory.Exists(localdirectory))
                    Directory.CreateDirectory(localdirectory);


                using (var stream = new FileStream(localpath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                result.Add(file.Name, $"{Request.Scheme}{Uri.SchemeDelimiter}{Request.Host.Host}/{filepath.Replace(Path.DirectorySeparatorChar, '/')}");
            }

            // process uploaded files
            // Don't rely on or trust the FileName property without validation.

            return Ok(ApiModel.AsSuccess(result));
        }

        // public class UploadedFile
        // {
        //     public string LocalPath { get; set; }

        //     public string WebPath { get; set; }
        // }
        // /// <summary>
        // /// Uploads file asynchronously. 
        // /// </summary>
        // /// <param name="controller"> The controller. </param>
        // /// <param name="path"> The path. </param>
        // /// <returns></returns>
        // /// <exception cref="System.Exception">
        // /// Could not find a File in the request body
        // /// </exception>
        // /// <exception cref="Exception"> Could not find a File in the request body </exception>
        // public async Task<IEnumerable<UploadedFile>> UploadAsync(string path)
        // {
        //     var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        //     var filepath = _appSettings.DefaultUploadPath;

        //     if (path.Any())
        //         filepath = Path.Combine(filepath, Path.Combine(path.Split('/').Select(p => p.RemoveDiacritics()).ToArray()));

        //     if (!Request.Form.Files.Any()) throw new Exception("Could not find a File in the request body");
        //     var infos = new List<UploadedFile>();

        //     foreach (var file in Request.Form.Files)
        //     {
        //         if (file.Length <= 0 || file.FileName == null) continue;
        //         var name = Path.GetFileNameWithoutExtension(file.FileName).RemoveDiacritics();
        //         var ext = Path.GetExtension(file.FileName);
        //         filepath = Path.Combine(filepath, name + ext).Trim(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

        //         var localpath = Path.Combine(wwwroot, filepath);
        //         var localdirectory = Path.GetDirectoryName(localpath);
        //         if (!Directory.Exists(localdirectory))
        //             Directory.CreateDirectory(localdirectory);
        //         using (var targetStream = System.IO.File.Create(localpath))
        //         {
        //             await file.CopyToAsync(targetStream);
        //         }
        //         infos.Add(new UploadedFile { LocalPath = localpath, WebPath = $"/{filepath.Replace(Path.DirectorySeparatorChar, '/')}" });
        //     }
        //     return infos;
        // }

    }

}