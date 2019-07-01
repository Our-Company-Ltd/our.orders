import {  Price, ProductOption } from '.';
import { ModelBase } from './ModelBase';

export type Product = ModelBase & {
    UID: string;
    Type: 'product';
    Title: string;
    Src?: string;
    Favorite: boolean;
    Blob?: Blob;
    Description?: string;
    SKU?: string;
    Categories?: string[];
    BasePrice?: Price[];
    PurchasePrice?: Price[];
    Supplier?: string; 
    MinQuantity?: number | null;
    MaxQuantity?: number | null;
    Options?: ProductOption[];
    Products?: Product[];
    TaxRateIncluded?: number | null;
    TaxRateExcluded?: number | null;
    Weight?: number | null;
    NeedsDispatch?: boolean | null;
    Stock?: {
        [warehouseId: string]: number;
    };
};