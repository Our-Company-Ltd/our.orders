import {
    defineMessages
} from 'react-intl';

export const UsersDetailMessages = defineMessages({
    deleteConfirm: {
        id: 'src.components.settings.users.usersDetail.deleteConfirm',
        defaultMessage: 'Are you sure you want to delete this product?',
        description: 'Default messege for confirm if user are sure about deleting the product'
    }, 
    delete: {
        id: 'src.components.settings.users.usersDetail.delete',
        defaultMessage: 'delete',
        description: 'Legend for delete button'
    }, 
    save: {
        id: 'src.components.settings.users.usersDetail.save',
        defaultMessage: 'save',
        description: 'Legend for save button'
    }, 
    create: {
        id: 'src.components.settings.users.usersDetail.create',
        defaultMessage: 'create',
        description: 'Legend for create user button'
    }, 
    resetPassword: {
        id: 'src.components.settings.users.usersDetail.resetPassword',
        defaultMessage: 'Request Reset Password link',
        description: 'Legend for reset password link field'
    }
});

export default UsersDetailMessages;