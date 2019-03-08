import { config, addAuthHeader, handleApiResponse } from 'src/_helpers';
import { Order, Payment } from 'src/@types/our-orders';

export type PaypalSettings = PaypalClient & { Environment: 'production' | 'sandbox' };
export const GetPaypalClient = (): Promise<PaypalSettings> => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    const url = `${config.apiUrl}/paypal`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<PaypalSettings>(handleApiResponse)
        .then(response => {
            return response;
        });
};

type chargeRequest = {
    OrderID: string;
    PaymentId: string;
    PayerId: string;
};

export const ChargePaypalPayment = (order: Order, data: PaypalData): Promise<Payment[]> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderID: order.Id, PaymentId: data.paymentID, PayerId: data.payerID } as chargeRequest)
    };

    const url = `${config.apiUrl}/paypal`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<Payment[]>(handleApiResponse)
        .then(response => {
            return response;
        });
};

// type createRequest = {
//     OrderID: string;
//     Amount: number;
//     Currency: string;
// };

// export const CreatePaypalPayment = (order: Order, amount: number, currency: string): Promise<PaypalData> => {
//     const requestOptions = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ OrderID: order.Id, Amount: amount, Currency: currency } as createRequest)
//     };

//     const url = `${config.apiUrl}/paypal`;
//     return fetch(url, addAuthHeader(requestOptions))
//         .then<PaypalData>(handleApiResponse)
//         .then(response => {
//             return response;
//         });
// };