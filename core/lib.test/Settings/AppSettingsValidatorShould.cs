using System;
using our.orders.Helpers;
using our.orders.Models;
using Xunit;

namespace our.orders.test.Settings
{
    public class AppSettingsValidatorShould
    {

        [Theory]
        [InlineData("%%")]
        [InlineData("&%^")]
        [InlineData("é")]
        public void ThrowExceptionIfPathInvalid(string invalidPath)
        {
            // [Setup]
            // setup webhost using appsettings with specific path
            var appSettingsValidator = new AppSettingsValidator();
            var appSettings = new AppSettings();

            appSettings.Path = invalidPath;

            // [Verify]
            // we expect to have a appsettings invalid exception
            Assert.Throws<InvalidAppSettingsException>(() =>
            {
                appSettingsValidator.EnsureValid(appSettings);
            });

            // [Teardown]
            // nothing to tear down
        }


        [Theory]
        // too short secret (byte length < 512)
        [InlineData("")]
        public void ThrowExceptionIfSecretNotValid(string invalidSecret)
        {
            // [Setup]
            // setup webhost using appsettings with specific path
            var appSettingsValidator = new AppSettingsValidator();
            var appSettings = new AppSettings();

            appSettings.JwtSecret = invalidSecret;

            // [Verify]
            // we expect to have a appsettings invalid exception
            Assert.Throws<InvalidAppSettingsException>(() =>
            {
                appSettingsValidator.EnsureValid(appSettings);
            });

            // [Teardown]
            // nothing to tear down
        }

        [Theory]
        [InlineData(typeof(object))]
        [InlineData(null)]
        [InlineData(typeof(Product))]
        public void ThrowExceptionIfOrderTypeNotValid(Type orderType)
        {
            // [Setup]
            // setup webhost using appsettings with specific path
            var appSettingsValidator = new AppSettingsValidator();
            var appSettings = new AppSettings();

            appSettings.OrderType = orderType;

            // [Verify]
            // we expect to have a appsettings invalid exception
            var exception = Assert.Throws<InvalidAppSettingsException>(() =>
            {
                appSettingsValidator.EnsureValid(appSettings);
            });

            Assert.Equal(nameof(appSettings.OrderType), exception.PropertyName);

            // [Teardown]
            // nothing to tear down
        }

        [Theory]
        [InlineData(typeof(object))]
        [InlineData(null)]
        [InlineData(typeof(Order))]
        public void ThrowExceptionIfProductTypeNotValid(Type productType)
        {
            // [Setup]
            // setup webhost using appsettings with specific path
            var appSettingsValidator = new AppSettingsValidator();
            var appSettings = new AppSettings();

            appSettings.ProductType = productType;

            // [Verify]
            // we expect to have a appsettings invalid exception
            var exception = Assert.Throws<InvalidAppSettingsException>(() =>
           {
               appSettingsValidator.EnsureValid(appSettings);
           });

            Assert.Equal(nameof(appSettings.ProductType), exception.PropertyName);

            // [Teardown]
            // nothing to tear down
        }

        [Theory]
        [InlineData(typeof(object))]
        [InlineData(null)]
        [InlineData(typeof(Product))]
        public void ThrowExceptionIfShippingTypeNotValid(Type ShippingType)
        {
            // [Setup]
            // setup webhost using appsettings with specific path
            var appSettingsValidator = new AppSettingsValidator();
            var appSettings = new AppSettings();

            appSettings.ShippingType = ShippingType;

            // [Verify]
            // we expect to have a appsettings invalid exception
            var exception = Assert.Throws<InvalidAppSettingsException>(() =>
            {
                appSettingsValidator.EnsureValid(appSettings);
            });

            Assert.Equal(nameof(appSettings.ShippingType), exception.PropertyName);

            // [Teardown]
            // nothing to tear down
        }

        [Theory]
        [InlineData(typeof(object))]
        [InlineData(null)]
        [InlineData(typeof(Order))]
        public void ThrowExceptionIfClientTypeNotValid(Type ClientType)
        {
            // [Setup]
            // setup webhost using appsettings with specific path
            var appSettingsValidator = new AppSettingsValidator();
            var appSettings = new AppSettings();

            appSettings.ClientType = ClientType;

            // [Verify]
            // we expect to have a appsettings invalid exception
            var exception = Assert.Throws<InvalidAppSettingsException>(() =>
            {
                appSettingsValidator.EnsureValid(appSettings);
            });

            Assert.Equal(nameof(appSettings.ClientType), exception.PropertyName);

            // [Teardown]
            // nothing to tear down
        }

    }
}