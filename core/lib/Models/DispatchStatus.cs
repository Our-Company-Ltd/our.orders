namespace our.orders.Models
{
    public enum DispatchStatus
    {
        Init,
        Preparing,

        Pending,
        ReadyForDelivery,

        EnRoute,

        Undeliverable,

        Delivered,
    }
}