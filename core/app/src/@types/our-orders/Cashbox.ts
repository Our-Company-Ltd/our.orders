export type Cashbox = {
    [shopId: string]: {
        [currency: string]: number;
    };
};