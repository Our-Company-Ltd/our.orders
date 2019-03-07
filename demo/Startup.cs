using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using our.orders.Helpers;
using our.orders.Models;
using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using our.orders.Builder;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using our.orders.Identity;
using Microsoft.AspNetCore.Identity;
using System.IO;
using System;
using Microsoft.Extensions.DependencyInjection.Extensions;
using our.orders.Filters;
using our.orders.Repositories;
using Microsoft.AspNetCore.Http;
using our.orders.helpers;
using our.orders.Payments;
using our.orders.Newsletter;
using our.orders.Newsletter.CampaignMonitor;
using our.orders.Newsletter.MailChimp;
using our.orders.Payments.Stripe;
using our.orders.Payments.Paypal;
using our.orders.Repositories.EntityFramework;
using our.orders.Payments.PostFinance;
using Microsoft.AspNetCore.Hosting.Server.Features;

namespace our.orders.demo
{
    public class Startup
    {

        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            Configuration = configuration;

            HostingEnvironment = env;
        }

        public IConfiguration Configuration { get; }

        public IHostingEnvironment HostingEnvironment { get; }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // store sensitive infos in secrets
            // https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets

            var stripeSecretKey = Configuration["Stripe:SecretKey"];
            var stripePublishableKey = Configuration["Stripe:PublishableKey"];

            var clientIdSandbox = Configuration["Paypal:ClientIdSandbox"];
            var clientIdProduction = Configuration["Paypal:ClientIdProduction"];
            var secretSandbox = Configuration["Paypal:SecretSandbox"];
            var secretProduction = Configuration["Paypal:SecretProduction"];

            var postFinancePSPID = Configuration["PostFinance:PSPID"];
            var postFinanceCOM = Configuration["PostFinance:COM"];
            var postFinanceUSERID = Configuration["PostFinance:USERID"];
            var postFinancePSWD = Configuration["PostFinance:PWD"];
            var postFinanceSHASIGN = Configuration["PostFinance:SHASIGN"];

            var campaignMonitorApiKey = Configuration["CampaignMonitor:ApiKey"];
            var campaignMonitorListId = Configuration["CampaignMonitor:ListId"];

            var mailChimpApiKey = Configuration["MailChimp:ApiKey"];
            var mailChimpListId = Configuration["MailChimp:ListId"];

            services
                // .AddOurOrders((appSettings) => {
                //     appSettings.Path = "orders";
                //     // TODO: should we generate a JwtSecret per app ?
                //     appSettings.JwtSecret = "demo secret long enough";
                // })
                .AddOurOrders(Configuration)
                .UseEntityFramework(options => options.UseInMemoryDatabase("our.orders"))
                .UseCampaignMonitor(campaignMonitorApiKey, campaignMonitorListId)
                .UseMailChimp(mailChimpApiKey, mailChimpListId)
                .UseStripe(stripeSecretKey, stripePublishableKey)
                .UsePayPal(clientIdSandbox, clientIdProduction, secretSandbox, secretProduction, "sandbox")
                .UsePostFinance(postFinancePSPID, postFinanceCOM, postFinanceUSERID, postFinancePSWD, postFinanceSHASIGN, true);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IServiceProvider serviceProvider)
        {

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app
                .UseOurOrders(configureEvents: (appEvents) =>
                {
                    appEvents.Configure += (sender, s) =>
                    {
                        s.AddScoped<RandomData>();
                        s.AddCors();
                    };

                    appEvents.ApplicationStarted += (sender, s) =>
                    {
                        using (var scope = s.CreateScope())
                        {
                            var randomData = scope.ServiceProvider.GetService<RandomData>();
                            AsyncHelper.RunSync(() => randomData.Generate());
                        }

                    };

                    appEvents.ApplicationConfigure += (sender, appBuilder) =>
                    {
                        var serverAddressesFeature = app.ServerFeatures.Get<IServerAddressesFeature>();
                        // global cors policy
                        appBuilder.UseCors(x => x
                            .WithOrigins(serverAddressesFeature.Addresses.Concat(new string[] { "http://localhost:3000" }).ToArray())
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials());
                    };
                });


        }
    }
}
