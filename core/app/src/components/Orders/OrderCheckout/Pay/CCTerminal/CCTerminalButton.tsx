import * as React from 'react';

import { Order } from 'src/@types/our-orders';
import { RegisterCCTerminalPayment } from './Services';
import {
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    DialogActions, 
    withStyles, 
    ButtonBase, 
    WithStyles, 
    TextField
} from '@material-ui/core';
import { Dialpad } from '@material-ui/icons';
import PayBtnStyles, { PayBtnClasses } from '../../OrderCheckoutBtnStyles';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import createPalette from '@material-ui/core/styles/createPalette';

export type CCTerminalButtonProps = WithStyles<PayBtnClasses> & {
    order: Order;
    onChange: (changes: Partial<Order>) => void;
    refresh: () => void;
};

type State = {
    open: boolean;
    reference: string;
};

class CCTerminalButton extends React.Component<CCTerminalButtonProps, State> {
    constructor(props: CCTerminalButtonProps) {
        super(props);

        this._handleOpen = this._handleOpen.bind(this);
        this._handleClose = this._handleClose.bind(this);
        this._addTransfer = this._addTransfer.bind(this);

        this.state = {
            open: false,
            reference: ''
        };
    }
    render() {
        const { classes } = this.props;
        const { open, reference } = this.state;
        return (
            <React.Fragment>
                <ButtonBase
                    focusRipple={true}
                    onClick={this._handleOpen}
                    classes={{ root: classes.buttonBase }}
                >
                    <Dialpad className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        Card Terminal
                    </span>
                </ButtonBase>
                <Dialog
                    open={open}
                    onClose={this._handleClose}
                >
                    <DialogTitle>Payment informations</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <TextField
                                fullWidth={true}
                                type="text"
                                label="Reference"
                                value={reference}
                                onChange={(e) => this.setState({reference: e.target.value})}
                            />
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="default" onClick={this._handleClose}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={this._addTransfer}>Add Payment</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>);
    }

    private _handleOpen() {
        this.setState({ open: true });
    }

    private _handleClose() {
        this.setState({ open: false });
    }

    private _addTransfer() {
        const { order, order: { Total, PaidAmount }, refresh } = this.props;
        const { reference } = this.state;
        const amount = Total - PaidAmount;
        RegisterCCTerminalPayment(order, amount, reference)
            .then(refresh)
            .then(
                this._handleClose
            );
    }

}

export default withStyles((theme: OurTheme) =>
    PayBtnStyles(theme, createPalette({ primary: { main: '#99e9f2', contrastText: '#ffffff' } })))(CCTerminalButton);