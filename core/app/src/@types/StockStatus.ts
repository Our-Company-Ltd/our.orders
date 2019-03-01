import { OrderItem } from 'src/@types/our-orders';
export type StockStatus = {
    item: OrderItem;
    quantity: number;
    warehouseId?: string;
};
