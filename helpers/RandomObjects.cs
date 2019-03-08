using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Bogus;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Services;

namespace our.orders.helpers
{
    public static class RandomObjects
    {
        public enum CountryIso
        {
            FR,
            CH,
            DE,
            PT,
            IT,
            NL
        }

        public enum PaymentProvider
        {
            CASH,
            CREDIT_CARD,
            TRANSFER
        }


        public static Faker<Client> RandomClient()
        {

            return
                new Faker<Client>()
                    .StrictMode(false)
                    .Rules((f, o) =>
                        {
                            var person = f.Person;
                            o.FirstName = person.FirstName;
                            o.LastName = person.LastName;
                            o.OrganizationName = person.Company.Name;
                            o.PostalCode = person.Address.ZipCode;
                            o.City = person.Address.City;
                            o.CountryIso = f.Random.Enum<CountryIso>().ToString();
                            o.Email = person.Email;
                            o.Phone = f.Phone.PhoneNumber();
                            o.CellPhone = f.Phone.PhoneNumber();
                        });
        }

        public static Faker<Identity.User> RandomUser(IEnumerable<string> roles, IEnumerable<Shop> shops = null)
        {
            return
                new Faker<Identity.User>()
                    .StrictMode(false)
                    .Rules((f, o) =>
                        {
                            var person = f.Person;
                            o.FirstName = person.FirstName;
                            o.LastName = person.LastName;
                            o.UserName = person.UserName;
                            o.ShopId = shops != null ? f.PickRandom(shops).Id : null;
                            o.Email = person.Email;
                            o.Roles = roles.Select(Role.Normalize);
                        });
        }
        public static Faker<Models.Person> RandomPerson()
        {

            return
                new Faker<Models.Person>()
                    .StrictMode(false)
                    .Rules((f, o) =>
                        {
                            var person = f.Person;
                            o.FirstName = person.FirstName;
                            o.LastName = person.LastName;
                            o.OrganizationName = person.Company.Name;
                            o.PostalCode = person.Address.ZipCode;
                            o.City = person.Address.City;
                            o.CountryIso = f.Random.Enum<CountryIso>().ToString();
                            o.Email = person.Email;
                            o.Phone = f.Phone.PhoneNumber();
                            o.CellPhone = f.Phone.PhoneNumber();
                        });
        }
        public static Faker<Models.Warehouse> RandomWarehouse()
        {

            return
                new Faker<Models.Warehouse>()
                    .StrictMode(false)
                    .Rules((f, o) =>
                        {
                            var person = f.Person;
                            o.PostalCode = person.Address.ZipCode;
                            o.City = person.Address.City;
                            o.CountryIso = f.Random.Enum<CountryIso>().ToString();
                            o.Email = person.Email;
                            o.Phone = f.Phone.PhoneNumber();
                            o.Name = person.Company.Name;
                        });
        }

        public static Faker<Models.Shop> RandomShop()
        {

            return
                new Faker<Models.Shop>()
                    .StrictMode(false)
                    .Rules((f, o) =>
                        {
                            var person = f.Person;
                            o.OrganizationName = person.Company.Name;
                            o.PostalCode = person.Address.ZipCode;
                            o.City = person.Address.City;
                            o.CountryIso = f.Random.Enum<CountryIso>().ToString();
                            o.Email = person.Email;
                            o.Phone = f.Phone.PhoneNumber();
                            o.Name = person.Company.Name;
                        });
        }

        public static Faker<Models.Category> RandomCategory()
        {

            return
                new Faker<Models.Category>()
                    .StrictMode(false)
                    .RuleFor(c => c.Title, f => f.Commerce.Categories(1).First());
        }
        //   public DateTime Date { get; set; }

        //         public string UserId { get; set; }

        //         public string Note { get; set; }

        //         public string Currency { get; set; }

        //         public decimal Amount { get; set; }

        //         public string ShopId { get; set; }

        //         public bool Archived { get; set; }

        public static Faker<Voucher> RandomVoucher(DateTime? minDate = null, DateTime? maxDate = null, IEnumerable<string> currencies = null, decimal minvalue = 10, decimal maxvalue = 500, IEnumerable<IOrder> orders = null)
        {
            minDate = minDate == null ? DateTime.UtcNow.AddYears(-1) : minDate;
            maxDate = maxDate == null ? DateTime.UtcNow : maxDate;
            currencies = currencies ?? Enum.GetNames(typeof(CurrencyCodes));

            return
                new Faker<Voucher>()
                    .StrictMode(false)
                    .RuleFor(o => o.Expiration, f => f.Date.Between(minDate.Value, maxDate.Value))
                    .RuleFor(o => o.Code, f => f.Random.AlphaNumeric(6))
                    .RuleFor(o => o.Currency, f => f.Random.ArrayElement(currencies.ToArray()))
                    .RuleFor(o => o.OrderIds, f => orders != null ? f.Random.ArrayElements(orders.ToArray()).Select(o => o.Id) : Enumerable.Empty<string>())
                    .RuleFor(o => o.MultipleUse, f => f.Random.Bool(0.6f))
                    .RuleFor(o => o.Used, f => f.Random.Bool(0.4f))
                    .Rules((f, o) =>
                    {
                        var v = Math.Round(f.Random.Decimal(minvalue, maxvalue), 1);
                        o.Value = v;
                        o.InitialValue = v;
                    });

        }
        public static Faker<Movement> RandomMovement(DateTime? minDate = null, DateTime? maxDate = null, IEnumerable<string> currencies = null, decimal minvalue = 10, decimal maxvalue = 500, IEnumerable<Shop> shops = null, IEnumerable<User> users = null)
        {
            minDate = minDate == null ? DateTime.UtcNow.AddYears(-1) : minDate;
            maxDate = maxDate == null ? DateTime.UtcNow : maxDate;
            currencies = currencies ?? Enum.GetNames(typeof(CurrencyCodes));

            return
                new Faker<Movement>()
                    .StrictMode(false)
                    .RuleFor(o => o.Date, f => f.Date.Between(minDate.Value, maxDate.Value))
                    .RuleFor(o => o.Note, f => f.Random.Words(30))
                    .RuleFor(o => o.Currency, f => f.Random.ArrayElement(currencies.ToArray()))
                    .RuleFor(o => o.Amount, f => Math.Round(f.Random.Decimal(minvalue, maxvalue), 1))
                    .RuleFor(o => o.ShopId, f => shops != null ? f.Random.ArrayElement(shops.ToArray()).Id : "")
                    .RuleFor(o => o.Archived, f => f.Random.Bool(0.6f))
                    .Rules((f, o) =>
                    {
                        var user = users != null ? f.Random.ArrayElement(users.ToArray()) : null;
                        if (user != null)
                        {
                            o.UserId = user.Id;
                            o.User = user.Preview();
                        }
                    });

        }

        public static Faker<Dispatch> RandomDispatch(DateTime? minDate = null, DateTime? maxDate = null)
        {
            minDate = minDate == null ? DateTime.UtcNow.AddYears(-1) : minDate;
            maxDate = maxDate == null ? DateTime.UtcNow : maxDate;

            return
                new Faker<Dispatch>()
                    .StrictMode(false)
                    .RuleFor(o => o.Date, f => f.Date.Between(minDate.Value, maxDate.Value))
                    .RuleFor(o => o.Method, f => f.Random.Enum<DispatchMethod>())
                    .RuleFor(o => o.Status, f => f.Random.Enum<DispatchStatus>());
        }

        private static int OrdeRef = 0;
        public static Faker<Order> RandomOrder(IMapper mapper = null, IEnumerable<User> users = null, IEnumerable<string> currencies = null, IEnumerable<object> clients = null, IEnumerable<Shop> shops = null)
        {

            currencies = currencies ?? Enum.GetNames(typeof(CurrencyCodes));
            return
                new Faker<Order>()
                    .StrictMode(false)
                    .RuleFor(o => o.Date, f => f.Date.Between(DateTime.UtcNow.AddYears(-1), DateTime.UtcNow))
                    .Rules((f, o) =>
                        {
                            var client = clients != null ? f.Random.ArrayElement(clients.ToArray()) : RandomPerson().Generate();
                            if (client is Models.Person person)
                            {
                                o.Client = person;
                            }
                            if (client is IClient iClient && mapper != null)
                            {
                                o.Client = mapper.Map<Models.Person>(client);
                                o.ClientId = iClient.Id;
                            }
                        })
                    .RuleFor(o => o.Note, f => f.Random.Words(30))
                    .RuleFor(o => o.Currency, f => f.Random.ArrayElement(currencies.ToArray()))
                    .RuleFor(o => o.OrderType, f => OrderType.Order)
                    // will be set on order create (update) :
                    // .RuleFor(o => o.Status, f => f.Random.Enum<OrderStatus>())
                    .RuleFor(o => o.Canceled, f => f.Random.Bool(0.2f))
                    .RuleFor(o => o.Reference, f => (OrdeRef++).ToString("000000"))
                    .RuleFor(o => o.ShopId, f => shops != null ? f.Random.ArrayElement(shops.ToArray()).Id : "")
                    .RuleFor(o => o.UserId, f => users != null ? f.Random.ArrayElement(users.ToArray()).Id : "")
                    .RuleFor(o => o.Payments, (f, o) => RandomPayment(currencies, 1000m, 3000m).Generate(f.Random.Int(0, 4)))
                    .RuleFor(o => o.Dispatches, (f, o) => RandomDispatch().Generate(f.Random.Int(0, 2)));
        }

        public static Faker<Order> WithItems(this Faker<Order> faker, int itemsdepth = 0)
        {
            return
                faker
                    .RuleFor(o => o.Items, f => itemsdepth > 0 ? RandomOrderItem(itemsdepth - 1).Generate(f.Random.Int(1, 5)) : Enumerable.Empty<OrderItem>());
        }

        public static Faker<Order> WithProduct(this Faker<Order> faker, IMapper mapper, IEnumerable<IProduct> products)
        {

            return
                faker
                    .RuleFor(o => o.Items, f =>
                    {
                        var p = f.Random.ArrayElements(products.ToArray(), f.Random.Int(1, 5));
                        return p.Select(mapper.Map<OrderItem>).Select(o =>
                        {
                            o.Quantity = f.Random.Int(1, 2);
                            return o;
                        }).ToArray();
                    });
        }


        public static Faker<Order> WithDispatchedItems(this Faker<Order> faker, IEnumerable<Warehouse> warehouses)
        {

            return
                faker
                    .RuleFor(o => o.Items, f => RandomOrderItem(0).WithDispatchInfos(warehouses).Generate(f.Random.Int(1, 5)));
        }

        public static Faker<Order> RandomOrderCart(IMapper mapper = null, IEnumerable<string> currencies = null, int itemsdepth = 0, IEnumerable<object> clients = null, IEnumerable<Shop> shops = null)
        {

            currencies = currencies ?? Enum.GetNames(typeof(CurrencyCodes));
            return
                new Faker<Order>()
                    .StrictMode(false)
                    .RuleFor(o => o.Date, f => f.Date.Between(DateTime.UtcNow.AddDays(-10), DateTime.UtcNow))
                    .Rules((f, o) =>
                        {
                            var client = clients != null ? f.Random.ArrayElement(clients.ToArray()) : RandomPerson().Generate();
                            if (client is Models.Person person)
                            {
                                o.Client = person;
                            }
                            if (client is IClient iClient && mapper != null)
                            {
                                o.Client = mapper.Map<Models.Person>(client);
                                o.ClientId = iClient.Id;
                            }
                        })
                    .RuleFor(o => o.Note, f => f.Random.Words(30))
                    .RuleFor(o => o.Currency, f => f.Random.ArrayElement(currencies.ToArray()))
                    .RuleFor(o => o.OrderType, f => OrderType.Cart)
                    // will be set on order create (update) :
                    // .RuleFor(o => o.Status, f => f.Random.Enum<OrderStatus>())
                    .RuleFor(o => o.Canceled, f => f.Random.Bool(0.2f))
                    .RuleFor(o => o.Reference, f => (OrdeRef++).ToString("000000"))
                    .RuleFor(o => o.ShopId, f => shops != null ? f.Random.ArrayElement(shops.ToArray()).Id : "")
                    .RuleFor(o => o.Items, f => itemsdepth > 0 ? RandomOrderItem(itemsdepth - 1).Generate(f.Random.Int(1, 5)) : Enumerable.Empty<OrderItem>());
        }

        public static Faker<Payment> RandomPayment(IEnumerable<string> currencies = null, decimal minvalue = 10, decimal maxvalue = 500)
        {

            currencies = currencies ?? Enum.GetNames(typeof(CurrencyCodes));
            return
                new Faker<Payment>()
                    .StrictMode(false)
                    .RuleFor(o => o.Amount, f => Math.Round(f.Random.Decimal(minvalue, maxvalue), 1))
                    .RuleFor(o => o.Method, f => f.Random.Enum<PaymentMethod>())
                    .RuleFor(o => o.Status, f => f.Random.Enum<PaymentStatus>())
                    .RuleFor(o => o.Details, f => f.Random.Words(30))
                    .RuleFor(o => o.Provider, f => f.Random.Enum<PaymentStatus>().ToString())
                    .RuleFor(o => o.Reference, f => f.Random.Words(1))
                    .RuleFor(o => o.Date, f => f.Date.Between(DateTime.UtcNow.AddYears(-10), DateTime.UtcNow))
                    .RuleFor(o => o.Title, f => $"{f.Random.Enum<PaymentMethod>()} Payment")
                    .RuleFor(o => o.Currency, f => f.Random.ArrayElement(currencies.ToArray()));
        }
        public static Faker<OrderItem> RandomOrderItem(int subitemsdepth = 0)
        {
            // random product



            return
                new Faker<OrderItem>()
                    .StrictMode(false)
                    .RuleFor(o => o.Price, f => new Amount { Base = Math.Round(f.Random.Decimal(0, 300), 1), TaxRateIncluded = Decimal.Round(f.Random.Decimal(0, 0.2m), 2) })
                    .RuleFor(o => o.Description, f => f.Random.Words(20))
                    .RuleFor(o => o.UID, f => f.Random.Uuid().ToString())
                    .RuleFor(o => o.Title, f => f.Commerce.ProductName())
                    .RuleFor(o => o.Weight, f => f.Random.Decimal(0, 200))
                    .RuleFor(o => o.NeedsDispatch, f => f.Random.Bool(0.5f))
                    .RuleFor(o => o.Items, f => subitemsdepth > 0 ? RandomOrderItem(subitemsdepth - 1).Generate(f.Random.Int(1, 5)) : Enumerable.Empty<OrderItem>());
        }

        public static Faker<Order> RandomOrderItemFromProducts(this Faker<Order> faker, ProductService productService, List<Product> products, int subitemsdepth = 0)
        {
            // random product

            return faker
                .RuleFor(o => o.Items, (f, o) =>
                {
                    var ps = f.Random.ListItems(products);
                    return ps.Select(p =>
                    {
                        var selection = RandomSelection(p).Generate();
                        return productService.ToOrderItem(o, p, selection);
                    });
                });
        }
        public static Faker<ProductSelection> RandomSelection(Product product)
        {
            // random product

            return
                new Faker<ProductSelection>()
                    .StrictMode(false)
                    .RuleFor(o => o.ProductId, f => product.Id)
                    .RuleFor(o => o.Option, f =>
                    {
                        var index = f.Random.Int(0, product.Options.Count() - 1);

                        return new ProductOptionSelection { index = index, value = f.Random.Words(1) };
                    })
                    .RuleFor(o => o.Quantity, f => f.Random.Int(product.MinQuantity ?? 0, product.MaxQuantity ?? 0))
                    .RuleFor(o => o.Products, f =>
                    {
                        var c = product.Products.Count();
                        return f.Random.ListItems(product.Products.ToList()).Select(p =>
                        {
                            var index = f.Random.Int(0, product.Options.Count() - 1);
                            return new ProductSelection
                            {
                                ProductId = p.Id,
                                Option = new ProductOptionSelection { index = index, value = f.Random.Words(1) },
                                Quantity = f.Random.Int(p.MinQuantity ?? 0, p.MaxQuantity ?? 0)
                            };
                        });
                    });

        }


        public static Faker<OrderItem> WithDispatchInfos(this Faker<OrderItem> faker, IEnumerable<Warehouse> warehouses)
        {
            return
              faker
                  .RuleFor(o => o.DispatchInfos, (f, o) =>
                  {

                      return new DispatchInfo
                      {
                          Warehouse = f.Random.ArrayElement(warehouses.ToArray()).Id,
                          Date = f.Date.Between(DateTime.UtcNow.AddYears(-10), DateTime.UtcNow),
                          Quantity = f.Random.Int(0, o.Quantity)
                      };
                  });
        }


        public static Faker<StockUnit> RandomStockUnit(IProduct product, string[] WarehouseId)
        {
            return
                new Faker<StockUnit>()
                    .StrictMode(false)
                    .RuleFor(o => o.SKU, product.SKU)
                    .RuleFor(o => o.Units, f => WarehouseId.ToDictionary(k => k, k => f.Random.Int(0, 50)))
                    .RuleFor(o => o.Detail, f => f.Random.Words(f.Random.Int(0, 3)));
        }

        public static int ProductSKUUID = 0;
        public static Faker<Product> RandomProduct(IEnumerable<Category> categories, int subproductdepth = 0)
        {

            return
                new Faker<Product>()
                    .StrictMode(false)
                    .RuleFor(o => o.BarCode, f => f.Random.Double(0, 123456789123))
                    .RuleFor(o => o.BasePrice, f =>
                    {
                        var eurPrice = Decimal.Round(f.Random.Decimal(100, 200), 2);
                        return new Price[] {
                            new Price { Value = eurPrice, Currency = "EUR" },
                            new Price { Value = eurPrice*1.2m, Currency = "CHF" }
                            };
                    })
                    .RuleFor(o => o.Title, f => f.Commerce.ProductName())
                    .RuleFor(o => o.Description, f => f.Random.Words(30))
                    .RuleFor(o => o.Categories, f =>
                    {
                        var cats = f.Random.ArrayElements(categories.ToArray());
                        return cats.Select(c => c.Id);
                    })
                    .RuleFor(o => o.SKU, f => $"product-{ProductSKUUID++}")
                    .RuleFor(o => o.NeedsDispatch, f => f.Random.Bool(0.9f))
                    .RuleFor(o => o.Products, f => subproductdepth > 0 ? RandomProduct(Enumerable.Empty<Category>(), subproductdepth - 1).Generate(f.Random.Int(1, 5)) : Enumerable.Empty<Product>())
                    .Rules((f, o) =>
                        {
                            int min = f.Random.Int(0, 5);
                            int max = f.Random.Int(min, min + 5);
                            o.MinQuantity = min;
                            o.MaxQuantity = max;
                        });
        }

    }
}