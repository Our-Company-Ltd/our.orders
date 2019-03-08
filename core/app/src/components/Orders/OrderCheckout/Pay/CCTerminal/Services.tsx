import { Order } from 'src/@types/our-orders';
import { config, addAuthHeader, handleApiResponse } from 'src/_helpers';
type registerRequest = {
    OrderID: string;
    Amount: number;
    Reference: string;
};

export const RegisterCCTerminalPayment = (order: Order, amount: number, reference: string): Promise<Order> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderID: order.Id, Amount: amount, Reference: reference } as registerRequest)
    };

    const url = `${config.apiUrl}/ccterminal`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<Order>(handleApiResponse)
        .then(response => {
            return response;
        });
};