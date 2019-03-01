import * as React from 'react';

import { ButtonBase, DialogContent, DialogActions, Button, Typography } from '@material-ui/core';
import { Order, ApiModel, Payment } from 'src/@types/our-orders';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { withStyles, WithStyles, StyleRules } from '@material-ui/core/styles';
import { CardGiftcard } from '@material-ui/icons';
import PayBtnStyles, { PayBtnClasses } from '../../OrderCheckoutBtnStyles';
import createPalette from '@material-ui/core/styles/createPalette';
import { UseVoucher, ValidateVoucher, ValidateResponseReason } from './VoucherServices';
import VoucherCode, { CODE_LENGTH } from 'src/components/VoucherCode/VoucherCode';
import { InjectedIntlProps } from 'react-intl';
import VoucherMessages from './VoucherMessages';
import { InjectedAuthProps } from 'src/_context';
// import * as classNames from 'classnames';

type injectedClasses = PayBtnClasses | 'input' | 'inputWrong' | 'inputGood' | 'content' | 'title';
export type VoucherButtonProps =
    InjectedIntlProps &
    InjectedAuthProps & 
    WithStyles<injectedClasses> & {
        order: Order;
        onChange: (changes: Partial<Order>) => void;
        refresh: () => void;
    };

type State = {
    open: boolean;
    error?: string;
    valid?: boolean;
    reason?: ValidateResponseReason;
    code: string[];
    focussed: number;
};

class VoucherButton extends React.Component<VoucherButtonProps, State> {
    constructor(props: VoucherButtonProps) {
        super(props);
        this._close = this._close.bind(this);
        this._use = this._use.bind(this);
        this.state = { open: false, code: Array.from({ length: CODE_LENGTH }, () => ''), focussed: 0 };
    }
    render() {
        const { classes, intl } = this.props;
        const toggle = () => this.setState(prev => ({ open: !prev.open }));

        return (
            <React.Fragment>
                <ButtonBase
                    focusRipple={true}
                    onClick={toggle}
                    classes={{ root: classes.buttonBase }}
                >
                    <CardGiftcard className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        {intl.formatMessage(VoucherMessages.voucher)}
                    </span>
                </ButtonBase>
                {this._renderLightbox()}
            </React.Fragment>);
    }

    private _renderLightbox() {
        const { classes, intl, authCtx } = this.props;
        const { open, code, error, valid, reason } = this.state;

        const change = (newCode: string[]) => {

            const toValidate = newCode.every(c => !!c);
            this.setState(
                () => ({ code: newCode, valid: toValidate ? valid : undefined, reason: undefined }),
                () => {
                    if (newCode.every(c => !!c)) { this._validate(); }
                }
            );
        };

        let legend = intl.formatMessage(VoucherMessages.ok);

        if (reason && reason === 'used') {
            legend = intl.formatMessage(VoucherMessages.used);
        }

        if (reason && reason === 'notfound') {
            legend = intl.formatMessage(VoucherMessages.notfound);
        }

        if (reason && reason === 'expired') {
            legend = intl.formatMessage(VoucherMessages.expired);
        }

        if (reason && reason === 'empty') {
            legend = intl.formatMessage(VoucherMessages.empty);
        }

        return (
            <SideDialog
                open={open}
                onClose={() => this.setState(() => ({ open: false }))}
            >
                <DialogContent className={classes.content}>
                    <Typography
                        variant="h6"
                        align="center"
                        className={classes.title}
                    >
                        Voucher code
                    </Typography>
                    <VoucherCode
                        valid={valid}
                        code={code}
                        onChange={change}
                        authCtx={authCtx}
                    />
                </DialogContent>
                <DialogActions>
                    {error}
                    <Button
                        color="default"
                        variant="contained"
                        onClick={this._close}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        disabled={!valid}
                        onClick={this._use}
                    >
                        {legend}
                    </Button>
                </DialogActions>
            </SideDialog>);
    }
    private _close() {
        this.setState(() => ({ open: false }));
    }
    private _use() {
        const { order, refresh } = this.props;
        const { code } = this.state;
        UseVoucher(order, code.join(''))
            .then(() => {
                refresh();
                this._close();
            })
            .catch((r: ApiModel<Payment>) => this.setState(() => ({ error: r.Result && r.Result.Message || ''})));
    }
    private _validate() {
        const { order } = this.props;
        const { code } = this.state;
        ValidateVoucher(order, code.join(''))
            .then((r) => this.setState(() => ({ valid: r.Result, reason: r.Reason })));
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> =>
    ({
        content: {
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column'
        },
        title: {
            marginBottom: theme.spacing.unit
        },
        ...PayBtnStyles(theme, createPalette({ primary: { main: '#ff6464', contrastText: '#ffffff' } })),
        input: {
            display: 'flex',
            height: 150,
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `inset 2px 1px 15px -7px rgba(0, 0, 0, 0.2)`,
            fontSize: 80,
            width: '100%',
            justifyContent: 'center',
            // tslint:disable-next-line:no-any
            textAlign: 'center' as any,
            fontFamily: 'monospace'
        },
        inputWrong: {
            borderColor: theme.palette.error.main,
            boxShadow: `inset 2px 1px 15px -7px ${theme.palette.error.light}`,
            color: theme.palette.error.main
        },
        inputGood: {
            borderColor: theme.Colors.green.primary.main,
            boxShadow: `inset 2px 1px 15px -7px ${theme.Colors.green.primary.light}`,
            color: theme.Colors.green.primary.main
        }
    }))(VoucherButton);
