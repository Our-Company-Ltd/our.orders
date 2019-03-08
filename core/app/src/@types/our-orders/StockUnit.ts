import { ModelBase } from '.';

export interface StockUnit extends ModelBase {
    SKU: string;
    Detail: string;
    Name: string;
    Units: {
        [warehouse: string]: number;
    };
}