namespace our.orders.Models
{
    public enum OrderStatus
    {
        Empty,
        Canceled,
        PendingPayment,
        ToDispatch,
        Dispatching,
        Done
    }
}