import {
    defineMessages
} from 'react-intl';

export const VoucherFieldsMessages = defineMessages({
    initialValue: {
        id: 'src.components.forms.vouchers.initialValue',
        defaultMessage: 'Initial value',
        description: 'Legend for voucher initial value'
    },
    currentValue: {
        id: 'src.components.forms.vouchers.currentValue',
        defaultMessage: 'Current value',
        description: 'Legend for value on a voucher'
    },
    code: {
        id: 'src.components.forms.vouchers.code',
        defaultMessage: 'Code',
        description: 'Legend for voucher code'
    },
    expiration: {
        id: 'src.components.forms.vouchers.expiration',
        defaultMessage: 'Expiration date',
        description: 'Legend for expiration date of a voucher'
    },
    multipleUse: {
        id: 'src.components.forms.vouchers.multipleUse',
        defaultMessage: 'Allow multiple uses',
        description: 'Legend for multiple use switch'
    },
    canceled: {
        id: 'src.components.forms.vouchers.canceled',
        defaultMessage: 'Canceled',
        description: 'Legend for canceled attribute in voucher'
    },
    usedVoucher: {
        id: 'src.components.forms.vouchers.usedVoucher',
        defaultMessage: 'Used',
        description: 'Legend for used attribute in voucher'
    },
    currency: {
        id: 'src.components.forms.vouchers.currency',
        defaultMessage: 'Currency',
        description: 'Legend for currency legend'
    }
});

export default VoucherFieldsMessages;