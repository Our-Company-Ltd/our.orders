import { Filter } from '../_helpers/Filter';
export type FilterDefinition = {
    filters: Filter[];
    query: string;
    sort: string;
    operator: 'and' | 'or';
};