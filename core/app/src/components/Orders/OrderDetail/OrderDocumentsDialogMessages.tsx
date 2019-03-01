import {
    defineMessages
} from 'react-intl';

export const OrderDocumentsDialogMessages = defineMessages({
    actionPrint: {
        id: 'src.components.order.orderDetail.orderDocumentsDialog.actionPrint',
        defaultMessage: 'Print',
        description: 'Legend for dialog action print'
    },
    dialogTitle: {
        id: 'src.components.order.orderDetail.orderDocumentsDialog.dialogTitle',
        defaultMessage: 'Select template',
        description: 'Legend for dialog title'
    },
    inputLegend: {
        id: 'src.components.order.orderDetail.orderDocumentsDialog.inputLegend',
        defaultMessage: 'Template',
        description: 'Legend for legend input'
    },
    deleteConfirm: {
        id: 'src.components.order.orderDetail.orderDocumentsDialog.deleteConfirm',
        defaultMessage: 'Are you sure you want to delete this order?',
        description: 'Default messege for confirm if user are sure about deleting the order'
    }
});

export default OrderDocumentsDialogMessages;