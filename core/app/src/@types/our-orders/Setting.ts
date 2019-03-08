import { PaymentProviderName } from '.';
export type Currency = {
    Name: string;

    Code: string;

    Rate: number;
};

export type Setting = {
    ShowWeight: boolean;

    ShowTaxRateExcluded: boolean;

    ShowTaxRateIncluded: boolean;

    TaxRateExcluded?: number;

    TaxRateIncluded?: number;

    Currencies: Currency[];

    Path: string;

    PaymentProviders: PaymentProviderName[];

    NewsletterProviders: string[];

    HidePaymentProviders: string[];

    TransferMessage: string;
};
