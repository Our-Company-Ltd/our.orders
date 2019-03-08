import { Amount, DispatchInfo, OrderOption } from '.';

export type OrderItem = {

    UID: string;

    Title?: string;

    Description?: string;

    // ProductId: string;

    Quantity?: number;

    Price?: Amount;

    Tax?: number;

    // OptionsPrice: number;

    Weight?: number;

    UnitPrice?: number;

    FinalPrice?: number;

    Src?: string;

    FinalWeight?: number;

    SKU?: string;

    DispatchInfos?: DispatchInfo;

    NeedsDispatch?: boolean;

    StockUpdated?: boolean;

    Option?: OrderOption;

    Items: OrderItem[];
};