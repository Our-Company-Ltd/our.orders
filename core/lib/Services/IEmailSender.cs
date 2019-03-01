using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace our.orders.Services
{
    public interface IEmailSender
    {
        Task<bool> SendEmailAsync(string email, string subject, string message);
    }

    public class LoggerSender : IEmailSender
    {
        /// <summary>
        /// The logger to log into
        /// </summary>
        protected readonly ILogger<LoggerSender> Logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="LoggerSender" /> class.
        /// </summary>
        /// <param name="logger"> The logger. </param>
        public LoggerSender(ILogger<LoggerSender> logger)
        {
            Logger = logger;
        }

        /// <inheritdoc />
        public Task<bool> SendEmailAsync(string email, string subject, string message)
        {
            Logger.LogInformation($"sending email to {email} : \n subject: {subject} \n body: \n {message}");
            return Task.FromResult(true);
        }
    }
}