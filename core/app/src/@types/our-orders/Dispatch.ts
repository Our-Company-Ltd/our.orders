import { DispatchMethod, DispatchStatus } from '.';
export type Dispatch = {
    Date: Date | string;
    Id: string;
    Notes?: string;
    Method?: DispatchMethod;
    Status?: DispatchStatus;
};
