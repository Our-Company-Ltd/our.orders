namespace our.orders.Models
{
    public enum FilterOperator
    {
        eq,
        ne,
        lt,
        gt,
        lte,
        gte,
        and,
        or,

        like,
        isnotnull,
        isnull
    }
}