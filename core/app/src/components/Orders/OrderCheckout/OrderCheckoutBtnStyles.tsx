import { StyleRules } from '@material-ui/core/styles';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { Palette } from '@material-ui/core/styles/createPalette';

export type PayBtnClasses = 'buttonBase' | 'btnIcon' | 'btnText';
const PayBtnStyles = (theme: OurTheme, palette: Palette): StyleRules<PayBtnClasses> => ({
    buttonBase: {
        ...theme.typography.button,
        borderRadius: theme.shape.borderRadius,
        color: palette.primary.contrastText,
        backgroundColor: palette.primary.main,
        boxShadow: theme.shadows[2],
        width: '100%',

        flexWrap: 'wrap',

        padding: theme.spacing.unit,
        boxSizing: 'border-box',

        '&:active': {
            boxShadow: theme.shadows[8],
        },
        '&:hover': {
            backgroundColor: palette.primary.light,
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: palette.primary.main
            }
        },
    },
    btnIcon: {
        display: 'block',
        width: '100%',
        maxHeight: '100px',
        height: '50%'
    },
    btnText: {
        display: 'block',
        paddingTop: theme.spacing.unit,

        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
});
export default PayBtnStyles;