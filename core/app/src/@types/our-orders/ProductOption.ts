import { Price } from '.';

export type ProductOption = {
    Title: string;
    Id: string;
    SKU: string;
    Src?: string;
    Blob?: Blob;
    BasePrice: Price[];
};
