import { config, addAuthHeader, handleApiResponse } from 'src/_helpers';
import { Order, Payment } from 'src/@types/our-orders';

type chargeRequest = {
    OrderID: string;

    /**
     * Card/account number.
     */
    CardNo: string;

    /**
     * Card Verification Code. Depending on the card brand, 
     * the verification code will be a 3- or 4-digit code 
     * on the front or rear of the card, an issue number, 
     * a start date or a date of birth.
     */
    CVC: string;

    /**
     * Expiry date.
     */
    ExpiryDate: string;

    /**
     * Amount to be paid
     */
    Amount: number;

};

export const ChargePostFinance = (order: Order, CardNo: string, CvC: string, expiryDate: string): Promise<Payment> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            {
                OrderID: order.Id,
                CVC: CvC,
                ExpiryDate: expiryDate,
                Amount: order.Total,
                CardNo: CardNo
            } as chargeRequest)
    };

    const url = `${config.apiUrl}/postfinance`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<Payment>(handleApiResponse)
        .then(response => {
            return response;
        });
};
export type PostFinanceFormResponse = {
    name: string;
    action: string;
    param: Object;
    amount: string;
    txid: string;
    method: string;
};
export const GetFormPostFinance = (order: Order): Promise<PostFinanceFormResponse> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            {
                OrderID: order.Id,
                Amount: order.Total
            })
    };

    const url = `${config.apiUrl}/postfinance/form`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<PostFinanceFormResponse>(handleApiResponse)
        .then(response => {
            return response;
        });
};