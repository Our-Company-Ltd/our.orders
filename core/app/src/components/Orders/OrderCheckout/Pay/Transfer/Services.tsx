import { config, addAuthHeader, handleApiResponse } from 'src/_helpers';
import { Order } from 'src/@types/our-orders';
type registerRequest = {
    OrderID: string;
    Amount: number;
};

export const RegisterTransferPayment = (order: Order, amount: number): Promise<Order> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderID: order.Id, Amount: amount } as registerRequest)
    };

    const url = `${config.apiUrl}/transfer`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<Order>(handleApiResponse)
        .then(response => {
            return response;
        });
};

export const GetTransferPaymentMessage = (order: Order): Promise<string> => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    const url = `${config.apiUrl}/transfer/message/${order.Id}`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<string>(handleApiResponse)
        .then(response => {
            return response;
        });
};