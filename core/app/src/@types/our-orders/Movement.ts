import { ModelBase } from '.';

export type Movement = ModelBase & {
    Date:  Date | string;
    UserId: string;
    User: string;
    Note: string;
    Currency: string;
    Amount: number;
    ShopId: string;
    Archived: boolean;
};
