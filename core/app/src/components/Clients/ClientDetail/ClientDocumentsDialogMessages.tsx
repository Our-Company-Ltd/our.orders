import {
    defineMessages
} from 'react-intl';

export const OrderDocumentsDialogMessages = defineMessages({
    actionPrint: {
        id: 'src.components.client.clientDetail.actionPrint',
        defaultMessage: 'Print',
        description: 'Legend for dialog action print'
    },
    dialogTitle: {
        id: 'src.components.client.clientDetail.dialogTitle',
        defaultMessage: 'Select template',
        description: 'Legend for dialog title'
    },
    inputLegend: {
        id: 'src.components.client.clientDetail.inputLegend',
        defaultMessage: 'Template',
        description: 'Legend for legend input'
    },
    deleteConfirm: {
        id: 'src.components.client.clientDetail.deleteConfirm',
        defaultMessage: 'Are you sure you want to delete this client?',
        description: 'Default messege for confirm if user are sure about deleting the client'
    }
});

export default OrderDocumentsDialogMessages;