import { ModelBase } from '.';

export interface Voucher extends ModelBase {
   InitialValue: number;
   Value: number;
   Code: string;
   Currency: string;
   Expiration: Date | string | null;
   MultipleUse: boolean;
   
   Used: boolean;

   Expired: boolean;

   Valid: boolean;
   OrderIds: string[];
   Preview: string;
}
