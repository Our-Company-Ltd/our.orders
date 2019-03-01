import { defineMessages, InjectedIntl } from 'react-intl';
import { PaymentStatus } from 'src/@types/our-orders';

export const paymentStatusMessages = defineMessages({
    Pending: {
        id: 'PaymentStatus.Pending',
        defaultMessage: 'Pending',
        description: 'Legend for payment status'
    },
    Canceled: {
        id: 'PaymentStatus.Canceled',
        defaultMessage: 'Canceled',
        description: 'Legend for payment status'
    },
    Failed: {
        id: 'PaymentStatus.Failed',
        defaultMessage: 'Failed',
        description: 'Legend for payment status'
    },
    Paid: {
        id: 'PaymentStatus.Paid',
        defaultMessage: 'Paid',
        description: 'Legend for payment status'
    }

});

export const GetPaymentStatusLegend = (intl: InjectedIntl, status: PaymentStatus): string => {
    var messageDescriptor = paymentStatusMessages[status] ||
     { defaultMessage: status.toString(), id: `PaymentStatus.${status}` };
    return intl.formatMessage(messageDescriptor);
};