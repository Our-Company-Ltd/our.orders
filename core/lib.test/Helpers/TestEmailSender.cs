using System.Collections.Generic;
using System.Threading.Tasks;
using our.orders.Models;
using our.orders.Services;
using System.Linq;

namespace our.orders.test.Helpers
{
    public class TestEmailSender : IEmailSender
    {
        public class Email
        {
            public string email;
            public string subject;
            public string message;
        }


        public TestEmailSender()
        {
            recieved = new List<Email>();
        }
        public IEnumerable<Email> Recieved => recieved;

        private readonly IList<Email> recieved;

        public Task<bool> SendEmailAsync(string email, string subject, string message)
        {
            recieved.Add(new Email { email = email, subject = subject, message = message });
            return Task.FromResult(true);
        }

        public IEnumerable<Email> Flush()
        {
            var result = recieved.ToArray();
            recieved.Clear();
            return result;
        }
    }
}
