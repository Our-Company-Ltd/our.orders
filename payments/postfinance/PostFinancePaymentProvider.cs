using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Newtonsoft.Json.Linq;
using our.orders.Models;
using our.orders.Services;

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
    }
}