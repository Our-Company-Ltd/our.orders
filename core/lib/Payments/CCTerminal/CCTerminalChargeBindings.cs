namespace our.orders.Payments.CCTerminal
{
    public class CCTerminalChargeBindings
    {
        public string OrderID { get; set; }

        public decimal Amount { get; set; }

        public string Reference { get; set; }
    }
}