import { ModelBase } from '.';

export interface Shop extends ModelBase {

    Name: string;

    Address: string;

    City: string;

    CountryIso: string;

    Email: string;

    OrganizationName: string;

    Phone: string;

    PostalCode: string;

    State: string;

    VATNumber: string;
}
