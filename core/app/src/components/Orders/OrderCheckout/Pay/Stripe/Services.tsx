import { config, addAuthHeader, handleApiResponse } from 'src/_helpers';
import { Order, Payment } from 'src/@types/our-orders';

export const GetStripeApiKey = (): Promise<string> => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    const url = `${config.apiUrl}/stripe`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<string>(handleApiResponse)
        .then(response => {
            return response;
        });
};

type chargeRequest = {
    OrderID: string;
    Amount: number;
    Token: string;
    Email?: number;
};

export const ChargeStripe = (order: Order, token: stripe.Token): Promise<Payment> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderID: order.Id, Token: token.id, Amount: order.Total } as chargeRequest)
    };

    const url = `${config.apiUrl}/stripe`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<Payment>(handleApiResponse)
        .then(response => {
            return response;
        });
};