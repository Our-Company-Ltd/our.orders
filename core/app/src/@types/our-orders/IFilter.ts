import { FilterOperator, FilterValue } from '.';
export type IFilter = {
    Operator?: FilterOperator;
    Value?: FilterValue;
    Property?: string;
    Id?: string;
    Children?: IFilter[];
};
