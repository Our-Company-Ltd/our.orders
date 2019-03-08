using System;
using System.Globalization;

namespace our.orders.Helpers
{
    // Custom exception class for throwing application specific exceptions (e.g. for validation) 
    // that can be caught and handled within the application
    public class InvalidAppSettingsException : Exception
    {
        public readonly string PropertyName;
        public InvalidAppSettingsException(string propertyName) : base() {
            this.PropertyName = propertyName;
        }

        public InvalidAppSettingsException(string propertyName, string message) : base(message) { 
            this.PropertyName = propertyName;
        }

        public InvalidAppSettingsException(string propertyName, string message, params object[] args) 
            : base(String.Format(CultureInfo.CurrentCulture, $"Invalid property: {propertyName} ({message})", args))
        {
            this.PropertyName = propertyName;
        }
    }
}