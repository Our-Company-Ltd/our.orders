using our.orders.Helpers;
using our.orders.Models;
using System;
using System.Text;

namespace our.orders
{
    public class AppSettingsValidator
    {
        public void EnsureValid(IAppSettings appsettings)
        {
            // validate path :            
            var pathvalid = Uri.IsWellFormedUriString(appsettings.Path, UriKind.Relative);
            if (!pathvalid)
            {
                throw new InvalidAppSettingsException(nameof(appsettings.Path));
            }

            // validate secret
            var secretValid =
                !string.IsNullOrWhiteSpace(appsettings.JwtSecret) &&
                Encoding.ASCII.GetBytes(appsettings.JwtSecret).Length >= (256 / 16);
            if (!secretValid)
            {
                throw new InvalidAppSettingsException(nameof(appsettings.JwtSecret));
            }


            // validate types
            var orderTypeValid =
                appsettings.OrderType != null &&
                appsettings.OrderType.Implements<IOrder>();
            if (!orderTypeValid)
            {
                throw new InvalidAppSettingsException(nameof(appsettings.OrderType), $"{nameof(appsettings.OrderType)} should implement {nameof(IOrder)}");
            }

            // validate product type
            var productTypeValid =
                appsettings.ProductType != null &&
                appsettings.ProductType.Implements<IProduct>();
            if (!productTypeValid)
            {
                throw new InvalidAppSettingsException(nameof(appsettings.ProductType), $"{nameof(appsettings.ProductType)} should implement {nameof(IProduct)}");
            }

            // validate shipping type
            var shippingTypeValid =
                appsettings.ShippingType != null &&
                appsettings.ShippingType.Implements<IShippingTemplate>();
            if (!shippingTypeValid)
            {
                throw new InvalidAppSettingsException(nameof(appsettings.ShippingType), $"{nameof(appsettings.ShippingType)} should implement {nameof(IShippingTemplate)}");
            }

            // validate client type
            var clientTypeValid =
                appsettings.ClientType != null &&
                appsettings.ClientType.Implements<IClient>();
            if (!clientTypeValid)
            {
                throw new InvalidAppSettingsException(nameof(appsettings.ClientType), $"{nameof(appsettings.ClientType)} should implement {nameof(IClient)}");
            }

        }
    }
}
