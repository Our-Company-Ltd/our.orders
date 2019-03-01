import { ApiResult } from '.';

export type ApiModel<TValue> = {
    Result: ApiResult;
    Value?: TValue;
};
