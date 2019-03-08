import { defineMessages, InjectedIntl } from 'react-intl';
import { PaymentMethod } from 'src/@types/our-orders';

export const paymentMethodMessages = defineMessages({
    Electronic: {
        id: 'PaymentMethod.Electronic',
        defaultMessage: 'Electronic',
        description: 'Legend for payment method - Electronic'
    },
    Cash: {
        id: 'PaymentMethod.Cash',
        defaultMessage: 'Cash',
        description: 'Legend for payment method - Cash'
    },
    Voucher: {
        id: 'PaymentMethod.Voucher',
        defaultMessage: 'Voucher',
        description: 'Legend for payment method - Voucher'
    }
});

export const GetPaymentMethodLegend = (intl: InjectedIntl, status: PaymentMethod): string => {
    var messageDescriptor = paymentMethodMessages[status] ||
     { defaultMessage: status.toString(), id: `PaymentMethod.${status}` };
    return intl.formatMessage(messageDescriptor);
};