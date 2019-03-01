using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using our.orders.Models;

namespace our.orders.Newsletter
{
    public class SubscribeBindings
    {
        [Required]
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public interface INewsletterProvider
    {
        string Name { get; }

        Task<IActionResult> RegisterAsync(SubscribeBindings bindings, CancellationToken cancellationToken = default(CancellationToken));
    }



}
