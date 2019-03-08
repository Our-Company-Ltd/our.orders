import { ProductOptionSelection } from '.';

export type ProductSelection = {
    ProductId: string;
    Quantity: number;
    Option?: ProductOptionSelection;
    Products: ProductSelection[];
};
