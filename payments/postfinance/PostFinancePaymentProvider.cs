using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Newtonsoft.Json.Linq;
using our.orders.Models;
using our.orders.Services;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using our.orders.Helpers;
using System.Net.Http;
using System.Net.Http.Headers;


namespace our.orders.Payments.PostFinance
{
    public class PostFinancePaymentProvider : PaymentProvider<PostFinanceChargeBindings>
    {
        public override string Name => "postfinance";

        // It is recommended to instantiate one HttpClient for the application's lifetime 
        // https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/
        private static readonly HttpClient client = new HttpClient();

        private readonly OrderService orderService;
        private readonly PostFinanceConfiguration configuration;

        // http://geeklearning.io/serialize-an-object-to-an-url-encoded-string-in-csharp/
        private static IDictionary<string, string> _ToKeyValue(object metaToken)
        {
            if (metaToken == null)
            {
                return null;
            }

            var token = metaToken as JToken;
            if (token == null)
            {
                return _ToKeyValue(JObject.FromObject(metaToken));
            }

            if (token.HasValues)
            {
                var contentData = new Dictionary<string, string>();
                foreach (var child in token.Children().ToList())
                {
                    var childContent = _ToKeyValue(child);
                    if (childContent != null)
                    {
                        contentData = contentData.Concat(childContent)
                                                .ToDictionary(k => k.Key, v => v.Value);
                    }
                }

                return contentData;
            }

            var jValue = token as JValue;
            if (jValue?.Value == null)
            {
                return null;
            }

            var value = jValue?.Type == JTokenType.Date ?
                            jValue?.ToString("o", CultureInfo.InvariantCulture) :
                            jValue?.ToString(CultureInfo.InvariantCulture);

            return new Dictionary<string, string> { { token.Path, value } };
        }

        private static void _SignWithSHA(IDictionary<string, string> dict, string ShaKey)
        {
            var sb = new StringBuilder();
            foreach (var key in dict.Keys.OrderBy(k => k))
            {
                var val = dict[key];

                if (string.IsNullOrEmpty(val) || key == "SHASIGN")
                {
                    continue;
                }

                sb.Append(key.ToUpperInvariant());
                sb.Append("=");
                sb.Append(val);
                sb.Append(ShaKey);

            }

            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
            var sha = new SHA1CryptoServiceProvider();
            byte[] hashed = sha.ComputeHash(bytes);

            sb = new StringBuilder(hashed.Length * 2);

            foreach (byte b in hashed)
            {
                sb.Append(b.ToString("X2"));
            }
            dict["SHASIGN"] = sb.ToString();
        }
        public PostFinancePaymentProvider(OrderService orderService, PostFinanceConfiguration configuration)
        {
            this.orderService = orderService;
            this.configuration = configuration;


        }
        public override async Task<IOrder> ChargeAsync(PostFinanceChargeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await this.orderService.GetByIdAsync(bindings.OrderID, cancellationToken);

            var requestBindings = new DirectLinkRequestRequiredBindings(
                configuration.PSPID,
                order.Id,
                configuration.USERID,
                configuration.PSWD,
                Convert.ToInt32(bindings.Amount * 100),
                order.Currency,
                bindings.CardNo,
                bindings.ExpiryDate,
                bindings.CVC,
                "SAL"
            );

            var requestDict = _ToKeyValue(requestBindings);

            // sign the dictionary
            _SignWithSHA(requestDict, configuration.SHASIGN);

            var content = new FormUrlEncodedContent(requestDict);

            // prod: https://e-payment.postfinance.ch/ncol/prod/orderdirect.asp.
            var postResult = await client.PostAsync("https://e-payment.postfinance.ch/ncol/test/orderdirect.asp", content, cancellationToken);

            var responseBytes = await postResult.Content.ReadAsByteArrayAsync();

            var serializer = new XmlSerializerHelper<DirectLinkResponseBinding>();
            var response = serializer.BytesToObject(responseBytes);
            switch (response.STATUS.ToString().FirstOrDefault())
            {
                case '5':
                    // sucesss
                    {
                        var payment = new Payment()
                        {
                            Title = "PostFinance Payment",
                            Provider = Name,
                            Reference = $"{response.PaymentID}",
                            Status = PaymentStatus.Paid,
                            Date = DateTime.UtcNow,
                            Method = PaymentMethod.Electronic,
                            Details = $"Payment Order #{order.Reference ?? order.Id}",
                            Currency = order.Currency,
                            Amount = bindings.Amount
                        };

                        await orderService.AddPayment(order, payment, cancellationToken);

                        return order;
                    }
                    
                case '9':
                    // payment requested 
                    {
                        var payment = new Payment()
                        {
                            Title = "PostFinance Payment",
                            Provider = Name,
                            Reference = $"{response.PaymentID}",
                            Status = PaymentStatus.Paid,
                            Date = DateTime.UtcNow,
                            Method = PaymentMethod.Electronic,
                            Details = $"Payment Order #{order.Reference ?? order.Id} (requested)",
                            Currency = order.Currency,
                            Amount = bindings.Amount
                        };

                        await orderService.AddPayment(order, payment, cancellationToken);

                        return order;
                    }

                default:
                    // error
                    {
                        var payment = new Payment()
                        {
                            Title = "PostFinance Payment",
                            Provider = Name,
                            Reference = $"{response.PaymentID}",
                            Status = PaymentStatus.Failed,
                            Date = DateTime.UtcNow,
                            Method = PaymentMethod.Electronic,
                            Currency = order.Currency,
                            Amount = bindings.Amount,
                            Details = await postResult.Content.ReadAsStringAsync()
                        };

                        await orderService.AddPayment(order, payment, cancellationToken);
                        return order;
                    }
            }
        }

        public const string FORM_ACTION_PROD = "https://e-payment.postfinance.ch/ncol/prod/orderstandard.asp";
        public const string FORM_ACTION_TEST = "https://e-payment.postfinance.ch/ncol/test/orderstandard.asp";

        public class PostFinanceFormBindings
        {
            [Required]
            public string OrderID { get; set; }

            /// <summary>
            /// Amount to be paid
            /// </summary>
            /// <returns></returns>
            [Required]
            public decimal Amount { get; set; }


            public string BackUrl { get; set; }

            public string AcceptUrl { get; set; }
            public string DeclineUrl { get; set; }

            public string CancelUrl { get; set; }

            public string ExceptionUrl { get; set; }


        }

        public class PostFinanceFormResponse
        {
            public string name { get; set; }

            public string action { get; set; }

            public Dictionary<string, string> param { get; set; }
            public string amount { get; set; }

            public string txid { get; set; }

            public string method { get; set; }

        }


        public async Task<PostFinanceFormResponse> GetFormAsync(PostFinanceFormBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await orderService.GetByIdAsync(bindings.OrderID, cancellationToken);

            var message = new HttpResponseMessage();
            var resp = new PostFinanceFormResponse();

            resp.method = "POST";

            resp.action = configuration.Sandbox ? FORM_ACTION_TEST : FORM_ACTION_PROD;
            var amount = bindings.Amount;
            var transactionUID = order.Reference + DateTime.Now.ToString("hh:mm:ss:ff").ShortMD5();
            // var payment = new Payment()
            // {
            //     Title = "PostFinance Payment",
            //     Provider = provider.Name,
            //     Reference = $"{transactionUID}",
            //     Status = PaymentStatus.Pending,
            //     Date = DateTime.UtcNow,
            //     Method = PaymentMethod.Electronic,
            //     Details = $"Payment Order #{order.Reference ?? order.Id}",
            //     Currency = order.Currency,
            //     Amount = amount,
            //     UID = transactionUID
            // };
            // await orderService.AddPayment(order, payment, cancellationToken);

            resp.amount = amount.ToString("0.00", CultureInfo.InvariantCulture);
            resp.txid = transactionUID;


            var formParams = new Dictionary<string, string>
                {
                    {"PSPID", configuration.PSPID },
                    {"orderID",  transactionUID},
                    {"amount", Math.Ceiling(amount * 100).ToString("0", CultureInfo.InvariantCulture)},
                    {"currency",  "CHF"},
                    {"language", "de" },
                    {"CN", (order.Client?.FirstName ?? "")+ " " + (order.Client?.LastName ?? "")},
                    {"EMAIL", order.Client?.Email ?? ""},
                    {"COM", configuration.COM},
                    { "PARAMPLUS", "ORDER=" + order.Id }
            };

            
            if (!string.IsNullOrEmpty(bindings.BackUrl))
                formParams.Add("backurl", bindings.BackUrl);
            if (!string.IsNullOrEmpty(bindings.AcceptUrl))
                formParams.Add("accepturl", bindings.AcceptUrl);
            if (!string.IsNullOrEmpty(bindings.DeclineUrl))
                formParams.Add("declineurl", bindings.DeclineUrl);
            if (!string.IsNullOrEmpty(bindings.CancelUrl))
                formParams.Add("cancelurl", bindings.CancelUrl);
            if (!string.IsNullOrEmpty(bindings.ExceptionUrl))
                formParams.Add("exceptionurl", bindings.ExceptionUrl);

            ////if (PARAMPLUS != null)
            //    formParams.Add("PARAMPLUS", PARAMPLUS(member));

            var strb = new StringBuilder();
            foreach (var kv in formParams.Where(kv => !string.IsNullOrEmpty(kv.Value as string)).OrderBy(k => k.Key))
            {
                strb.Append(kv.Key.ToUpperInvariant());
                strb.Append("=");
                strb.Append(formParams[kv.Key].ToString());
                strb.Append(configuration.SHASIGN);

            }

            var bytes = Encoding.UTF8.GetBytes(strb.ToString());
            var sha = new SHA1CryptoServiceProvider();
            var hashed = sha.ComputeHash(bytes);

            strb = new StringBuilder(hashed.Length * 2);
            foreach (byte b in hashed)
            {
                strb.Append(b.ToString("X2"));
            }

            formParams.Add("SHASIGN", strb.ToString());

            resp.param = formParams;


            message.Content = new StringContent(JsonConvert.SerializeObject(resp));
            message.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            return resp;
        }
    }
}