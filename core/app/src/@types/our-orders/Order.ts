import { ModelBase, OrderType, Amount, OrderStatus, OrderItem, Person, Payment, Dispatch } from '.';
export interface Order extends ModelBase {
    Type: 'order';

    OrderType?: OrderType;

    Tax: number;
    Delivery?: Amount;
    Price: number;
    Total: number;

    Reference?: string;
    Note?: string;
    Date?: Date | string;
    ClientId?: string;
    UserId?: string;

    ShipToClient?: boolean;
    Canceled?: boolean;
    NeedsDispatch?: boolean;

    NeedsStockUpdate: boolean;

    Dispatched: boolean;

    StockUpdated: boolean;

    ShopId?: string;

    Client?: Person;
    ShippingPerson?: Person;
    Status?: OrderStatus;
    Currency?: string;
    Items: OrderItem[];

    Weight: number;
    PaidAmount: number;
    Paid: boolean;

    ShippingTemplateId?: string;
    ShippingTemplateName?: string;
    // TODO: Shipping

    Payments: Payment[];

    // TODO: Dispatches
    Dispatches: Dispatch[];
}
