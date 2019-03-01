import { ApiResult } from './ApiResult';

export type FindResult<TValue> = {
    Count: number;
    Next: string;
    Previous: string;
    Start: number;
    Take: number;
    Result: ApiResult;
    Values: TValue[];
};
