import { Price } from '.';

export type ShippingPrice = {
    Base: Price[];
    PerUnit: Price[];
    MaxUnit: number;
};
