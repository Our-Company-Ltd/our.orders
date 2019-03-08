import { PaymentStatus, PaymentMethod } from '.';

export interface Payment {
    Title: string;
    Id: string;
    Provider: string;
    Details: string;
    Reference: string;
    Date: string;
    Status: PaymentStatus;
    Method: PaymentMethod;
    Amount: number;
    AmountOrderCurrency: number;
    Currency: string;
}
