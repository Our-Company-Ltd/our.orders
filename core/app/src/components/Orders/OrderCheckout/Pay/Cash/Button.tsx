import * as React from 'react';
import CashRegister from './CashRegister';
import { withStyles, WithStyles, ButtonBase } from '@material-ui/core';
import { Order } from 'src/@types/our-orders';
import PayBtnStyles, { PayBtnClasses } from '../../OrderCheckoutBtnStyles';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import createPalette from '@material-ui/core/styles/createPalette';
import CashIcon from './CashIcon';
import { InjectedSettingsProps } from 'src/_context';

export type CashButtonProps = WithStyles<PayBtnClasses> & InjectedSettingsProps & {
    order: Order;

    refresh: () => void;
};

type State = {
    open: boolean;
};

class CashButton extends React.Component<CashButtonProps, State> {
    constructor(props: CashButtonProps) {
        super(props);

        this._handleOpen = this._handleOpen.bind(this);
        this._handleClose = this._handleClose.bind(this);
        this.state = {
            open: false
        };
    }
    render() {
        const { classes, refresh, order, settingsCtx } = this.props;
        const { open } = this.state;
        const toggle = () => this.setState((prev) => ({ open: !prev.open }));
        return (
            <React.Fragment>
                <ButtonBase
                    focusRipple={true}
                    onClick={toggle}
                    classes={{ root: classes.buttonBase }}
                >
                    <CashIcon className={classes.btnIcon} />
                    <span className={classes.btnText}>
                    Cash
                </span>
                </ButtonBase>
                <CashRegister
                    settingsCtx={settingsCtx}
                    order={order}
                    refresh={refresh}
                    close={this._handleClose}
                    open={open}
                />
            </React.Fragment>);
    }
    private _handleOpen() {
        this.setState({ open: true });
    }

    private _handleClose() {
        this.setState({ open: false });
    }
}
// <div className="pay__btn-icon">
//     {getIcon(cashIcon)}
// </div>

export default withStyles((theme: OurTheme) =>
    PayBtnStyles(theme, createPalette({ primary: { main: '#85bb65', contrastText: '#ffffff' } })))(CashButton);