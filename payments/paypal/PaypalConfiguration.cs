namespace our.orders.Payments.Paypal
{
    public class PaypalConfiguration
    {
        // env?: 'production' | 'sandbox';
        public string Environment { get; set; } = "production";
        public string ClientIdSandbox { get; set; }
        public string ClientIdProduction  { get; set; }
        public string SecretSandbox { get; set; } 
        public string SecretProduction  { get; set; }

    }
}