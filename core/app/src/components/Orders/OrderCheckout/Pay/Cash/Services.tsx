import { config, addAuthHeader, handleApiResponse } from 'src/_helpers';
import { Order, Payment } from 'src/@types/our-orders';

type registerRequest = {
    OrderID: string;

    PaymentID: string;

    Amount: number;

    Change: number;

    AmountCurrency: string;
    ChangeCurrency: string;
};

export const RegisterCashPayment = (
    order: Order,
    amount: number,
    currency: string,
    change: number,
    changeCurrency: string
): Promise<Payment> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            OrderID: order.Id,
            Amount: amount,
            Change: change,
            AmountCurrency: currency,
            ChangeCurrency: changeCurrency
        } as registerRequest)
    };

    const url = `${config.apiUrl}/cash/register`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<Payment>(handleApiResponse)
        .then(response => {
            return response;
        });
};

export const GetChange = (
    order: Order,
    amount: number,
    currency: string,
    changeCurrency: string
): Promise<number> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            OrderID: order.Id,
            Amount: amount,
            AmountCurrency: currency,
            ChangeCurrency: changeCurrency
        } as registerRequest)
    };

    const url = `${config.apiUrl}/cash/change`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<number>(handleApiResponse)
        .then(response => {
            return response;
        });
};