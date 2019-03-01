import { defineMessages } from 'react-intl';

export const OrderStatusMessages = defineMessages({
    Empty: {
        id: 'OrderStatus.Empty',
        defaultMessage: 'Empty',
        description: 'Legend for order item whem is status is empty'
    },
    Canceled: {
        id: 'OrderStatus.Canceled',
        defaultMessage: 'Canceled',
        description: 'Legend for order item whem is status is canceled'
    },
    PendingPayment: {
        id: 'OrderStatus.PendingPayment',
        defaultMessage: 'Awaiting payment',
        description: 'Legend for order item whem is status is pending payment'
    },
    ToDispatch: {
        id: 'OrderStatus.ToDispatch',
        defaultMessage: 'ToDispatch',
        description: 'Legend for order item whem is status is paid'
    },
    Done: {
        id: 'OrderStatus.Done',
        defaultMessage: 'Done',
        description: 'Legend for order item whem is status is done'
    }

});
