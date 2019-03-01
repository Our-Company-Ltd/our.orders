import * as React from 'react';

import { Order } from 'src/@types/our-orders';
import { RegisterTransferPayment, GetTransferPaymentMessage } from './Services';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, withStyles, ButtonBase, WithStyles
} from '@material-ui/core';
import { SwapHoriz, Cached } from '@material-ui/icons';
import PayBtnStyles, { PayBtnClasses } from '../../OrderCheckoutBtnStyles';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import createPalette from '@material-ui/core/styles/createPalette';

export type TransferButtonProps = WithStyles<PayBtnClasses> & {
    order: Order;
    onChange: (changes: Partial<Order>) => void;
    refresh: () => void;
};

type State = {
    open: boolean;
    loading?: boolean;
    message?: string
};

class TransferButton extends React.Component<TransferButtonProps, State> {
    constructor(props: TransferButtonProps) {
        super(props);

        this._handleOpen = this._handleOpen.bind(this);
        this._handleClose = this._handleClose.bind(this);
        this._addTransfer = this._addTransfer.bind(this);

        this.state = {
            open: false
        };
    }
    render() {
        const { classes } = this.props;
        const { open, loading, message } = this.state;

        if (loading) {
            return (
                <ButtonBase
                    disabled={true}
                    classes={{ root: classes.buttonBase }}
                >
                    <Cached className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        loading
                    </span>
                </ButtonBase>);
        }

        return (
            <React.Fragment>
                <ButtonBase
                    focusRipple={true}
                    onClick={this._handleOpen}
                    classes={{ root: classes.buttonBase }}
                >
                    <SwapHoriz className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        Transfer
                    </span>
                </ButtonBase>
                <Dialog
                    open={open}
                    onClose={this._handleClose}
                >
                    <DialogTitle>Transfere payment informations</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="default" onClick={this._handleClose}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={this._addTransfer}>Add Transfer</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>);
    }

    private _handleOpen() {
        const { loading, message } = this.state;

        if (loading) { return; }
        if (message === undefined) {
            this.setState(
                () => ({ loading: true }),
                () => {
                    GetTransferPaymentMessage(this.props.order).then((m => {
                        this.setState(
                            () => ({
                                open: true,
                                message: m,
                                loading: false
                            })
                        );
                    }));
                }
            );
            return;
        }
        this.setState({ open: true });
    }

    private _handleClose() {
        this.setState({ open: false });
    }

    private _addTransfer() {
        const amount = this.props.order.Total - this.props.order.PaidAmount;
        RegisterTransferPayment(this.props.order, amount)
            .then(order => {
                this.props.refresh();
            }).then(
                this._handleClose
            );
    }

}

export default withStyles((theme: OurTheme) =>
    PayBtnStyles(theme, createPalette({ primary: { main: '#99e9f2', contrastText: '#ffffff' } })))(TransferButton);