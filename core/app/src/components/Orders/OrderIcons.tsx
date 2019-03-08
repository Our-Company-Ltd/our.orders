import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';

export type OrderIconClasses =
    'Cancelled' | 'PendingPayment' | 'Dispatching' | 'ToDispatch' | 'Done' | 'Empty' | 'Offer' | 'Cart';

export const OrderIconStyles = (theme: OurTheme): StyleRules<OrderIconClasses> => ({
    Empty: {
        color: theme.Colors.gray.primary.contrastText,
        backgroundColor: theme.Colors.gray.primary.main,
    },
    Cancelled: {
        color: theme.Colors.gray.primary.contrastText,
        backgroundColor: theme.Colors.gray.primary.main,
       
    },
    PendingPayment: {
        color: theme.Colors.orange.primary.contrastText,
        backgroundColor: theme.Colors.orange.primary.main,
       
    },
    ToDispatch: {
        color: theme.Colors.blue.primary.contrastText,
        backgroundColor: theme.Colors.blue.primary.main,
        
    },
    Dispatching: {
        color: theme.Colors.green.primary.contrastText,
        backgroundColor: theme.Colors.green.primary.light,
        
    },
    Done: {
        color: theme.Colors.gray.primary.contrastText,
        backgroundColor: theme.Colors.gray.primary.main,
       
    },
    Offer: {
        color: theme.Colors.gray.primary.contrastText,
        backgroundColor: theme.Colors.gray.primary.main,
       
    },
    Cart: {
        color: theme.Colors.gray.primary.contrastText,
        backgroundColor: theme.Colors.gray.primary.main,
       
    }
});