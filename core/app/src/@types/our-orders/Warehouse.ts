import { ModelBase } from '.';

export interface Warehouse extends ModelBase {

    Name: string;

    Address: string;

    City: string;

    CountryIso: string;

    Email: string;

    Phone: string;

    PostalCode: string;

    State: string;

    VATNumber: string;
}
