import {  defineMessages } from 'react-intl';

export const PaymentListMessages = defineMessages({
    addPayment: {
        id: 'src.components.forms.Payment.PaymentList.addPayment',
        defaultMessage: 'add payment',
        description: 'Legend for add payment button'
    },
    title: {
        id: 'src.components.forms.orderitem.title',
        defaultMessage: 'Title',
        description: 'Order item title'
    },
    reference: {
        id: 'src.components.forms.orderitem.reference',
        defaultMessage: 'Reference',
        description: 'Order item Reference'
    },
    description: {
        id: 'src.components.forms.orderitem.description',
        defaultMessage: 'Description',
        description: 'Order item Description'
    },
    amount: {
        id: 'src.components.forms.orderitem.amount',
        defaultMessage: 'Amount',
        description: 'Order item Amount'
    },
    date: {
        id: 'src.components.forms.orderitem.date',
        defaultMessage: 'Date',
        description: 'Order item Date'
    },
    paymentMethod: {
        id: 'src.components.forms.orderitem.paymentMethod',
        defaultMessage: 'Payment Method',
        description: 'Order item Payment Method'
    },
    status: {
        id: 'src.components.forms.orderitem.status',
        defaultMessage: 'Status',
        description: 'Order item Status'
    },
    provider: {
        id: 'src.components.forms.orderitem.provider',
        defaultMessage: 'Provider',
        description: 'Order item Provider'
    },
    currency: {
        id: 'src.components.forms.orderitem.currency',
        defaultMessage: 'Currency',
        description: 'Order item Currency'
    },
    details: {
        id: 'src.components.forms.orderitem.details',
        defaultMessage: 'Details',
        description: 'Order item Details'
    },
    lightboxTitle: {
        id: 'src.components.forms.orderitem.lightboxTitle',
        defaultMessage: 'Payment: {Title}',
        description: 'Order item title'
    }
});

export default PaymentListMessages;