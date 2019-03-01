import {
    defineMessages
} from 'react-intl';

export const VoucherMessages = defineMessages({
    voucher: {
        id: 'src.components.order.orderCheckout.Pay.Voucher.voucher',
        defaultMessage: 'voucher',
        description: 'Legend for voucher button'
    },
    ok: {
        id: 'src.components.order.orderCheckout.Pay.Voucher.ok',
        defaultMessage: 'Use voucher',
        description: 'Default legend for button in voucher pay screen'
    },
    notfound: {
        id: 'src.components.order.orderCheckout.Pay.Voucher.notfound',
        defaultMessage: 'Voucher not found',
        description: 'Legend when could not find a voucher to use'
    },
    expired: {
        id: 'src.components.order.orderCheckout.Pay.Voucher.expired',
        defaultMessage: 'Voucher expired',
        description: 'Legend when voucher is expired'
    },
    empty: {
        id: 'src.components.order.orderCheckout.Pay.Voucher.empty',
        defaultMessage: 'Voucher empty',
        description: 'Legend when voucher amount was used or equal to 0'
    },
    used: {
        id: 'src.components.order.orderCheckout.Pay.Voucher.used',
        defaultMessage: 'Voucher used',
        description: 'Legend when voucher user'
    }
});

export default VoucherMessages;