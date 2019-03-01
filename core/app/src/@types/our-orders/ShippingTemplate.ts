import { ModelBase, ShippingPrice, Price } from '.';

export type ShippingTemplate = ModelBase & {
    Title: string;
    Description: string;
    PerGram: ShippingPrice[];
    PerUnit: ShippingPrice[];
    TaxRateIncluded: number;
    TaxRateExcluded: number;
    BasePrice: Price[];
    InCountries: string[];
    OutCountries: string[];
    MinAmount: number | null;
    MaxAmount: number | null;
    MinDate: Date | string | null;
    MaxDate: Date | string | null;
    ExcludeSKUPattern: string;
};
