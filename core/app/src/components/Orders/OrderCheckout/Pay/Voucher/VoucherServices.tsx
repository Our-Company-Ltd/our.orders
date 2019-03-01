import { config, addAuthHeader, handleApiResponse } from 'src/_helpers';
import { Order, Payment } from 'src/@types/our-orders';

export type UseBindings = {
    Code: string;
    OrderId: string;
};

export const UseVoucher = (order: Order, code: string): Promise<Payment> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderId: order.Id, Code: code } as UseBindings)
    };

    const url = `${config.apiUrl}/voucherpayment/use`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<Payment>(handleApiResponse)
        .then(response => {
            return response;
        });
};
export type ValidateResponseReason = 'used' | 'expired' | 'notfound' | 'empty';
type ValidateResponse = {
    Result: boolean;
    Reason: ValidateResponseReason;
};

export const ValidateVoucher = (order: Order, code: string): Promise<ValidateResponse> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderId: order.Id, Code: code } as UseBindings)
    };

    const url = `${config.apiUrl}/voucherpayment/validate`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<ValidateResponse>(handleApiResponse)
        .then(response => {
            return response;
        });
};