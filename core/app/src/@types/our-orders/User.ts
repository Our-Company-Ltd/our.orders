import { ModelBase } from '.';

export interface User extends ModelBase {
    Id: string;
    UserName: string;
    ShopId: string;
    WarehouseId: string;
    Token: string;
    FirstName: string;
    LastName: string;
    Email: string;
    PhoneNumber: string;
    Roles: string[];
}
