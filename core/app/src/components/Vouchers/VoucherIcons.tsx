import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';

export type VoucherIconClasses =
    'Initial' | 'Canceled' | 'Used' | 'Expired';

export const VoucherIconStyles = (theme: OurTheme): StyleRules<VoucherIconClasses> => ({
    Canceled: {
        color: theme.Colors.gray.primary.contrastText,
        backgroundColor: theme.Colors.gray.primary.main,
       
    },
    Expired: {
        color: theme.Colors.gray.primary.contrastText,
        backgroundColor: theme.Colors.gray.primary.main,
       
    },
    Used: {
        color: theme.Colors.gray.primary.contrastText,
        backgroundColor: theme.Colors.gray.primary.main,
       
    },
    Initial: {
        color: theme.Colors.gray.primary.contrastText,
        backgroundColor: theme.Colors.green.primary.main,
       
    }
});