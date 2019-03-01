import { ModelBase, ModelType, Price, ProductOption } from '.';

export type Product = ModelBase & {
    Type: ModelType.Product;
    Title: string;
    Src?: string;
    Favorite: boolean;
    Blob?: Blob;
    Description?: string;
    SKU?: string;
    Categories?: string[];
    BasePrice?: Price[];
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