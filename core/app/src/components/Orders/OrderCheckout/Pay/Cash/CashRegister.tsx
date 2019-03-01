import * as React from 'react';

import { RegisterCashPayment, GetChange } from './Services';
import {
    TextField,
    Grid,
    DialogContent,
    DialogActions,
    Button,
    WithStyles,
    withStyles,
    ButtonBase
} from '@material-ui/core';
import { Order } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import { InjectedSettingsProps } from 'src/_context';

type injectedClasses =
    'container' |
    'inputValue' |
    'inputContainer' | 'currencyContainer' | 'currencyButton' | 'padBtn' | 'currencyButtonActive';
export type CashRegisterProps = WithStyles<injectedClasses> & InjectedSettingsProps & {
    order: Order;
    refresh: () => void;
    close: () => void;
    open: boolean;
};
type State = {
    loading?: boolean;
    amount: string;
    parsedAmount: number;
    change: number;
    currencyToPay: string;
    currencyRecieved: string;
    currencyChange: string;
};

class CashRegister extends React.Component<CashRegisterProps, State> {
    constructor(props: CashRegisterProps) {
        super(props);
        const defaultCurrency = props.order.Currency || props.settingsCtx.Settings.Currencies[0].Code;
        this.state = {
            amount: '',
            parsedAmount: 0,
            change: 0,
            currencyToPay: defaultCurrency,
            currencyRecieved: defaultCurrency,
            currencyChange: defaultCurrency
        };

        this._confirm = this._confirm.bind(this);
        this._handleScreenChange = this._handleScreenChange.bind(this);
        this._keyDown = this._keyDown.bind(this);
    }
    componentDidMount() {
        window.addEventListener('keydown', this._keyDown, true);
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this._keyDown);
    }
    render() {

        const { classes, close, open,
            order: { Total, PaidAmount }, settingsCtx: { Settings: { Currencies } } } = this.props;
        const { currencyRecieved, amount, change, currencyChange, currencyToPay } = this.state;

        const btns = [
            'c', 'cc', '',
            '1', '2', '3',
            '4', '5', '6',
            '7', '8', '9',
            '0', '00', '.',
        ];

        const parsed = parseFloat(amount) || 0;
        const toPay = Total - PaidAmount;

        // const floatingActionButtons: FloatingActionButtonProps[] = [
        //     {
        //         classNames: ['cash__save-button'],
        //         icon: {
        //             className: `material-icons`,
        //             inner: 'check',
        //             tag: 'i'
        //         },
        //         size: 'primary',
        //         onClick: this._confirm
        //     },
        //     {
        //         icon: {
        //             className: `material-icons`,
        //             inner: 'close',
        //             tag: 'i'
        //         },
        //         size: 'secondary',
        //         onClick: close
        //     }

        // ];
        const thereIsChange = parsed > Total;

        return (
            <SideDialog
                open={open}
                onClose={close}
            >
                <DialogContent className={classes.container}>
                    <GridContainer>
                        <Grid item={true} xs={12}>
                            <GridContainer style={{ flexWrap: 'nowrap' }}>
                                <Grid item={true} className={classes.inputContainer}>
                                    <TextField
                                        inputProps={{ className: classes.inputValue }}
                                        fullWidth={true}
                                        type="number"
                                        label="To pay"
                                        value={toPay}
                                        disabled={true}
                                    />
                                </Grid>
                                {Currencies.map(currency =>
                                    <Grid 
                                        key={currency.Code} 
                                        item={true} 
                                        className={classes.currencyContainer} 
                                        xs={2}
                                    >
                                        <ButtonBase
                                            onClick={() => this._handleCurrencyToPayClick(currency.Code)}
                                            classes={{
                                                root: classNames(
                                                    classes.currencyButton,
                                                    currencyToPay === currency.Code && classes.currencyButtonActive
                                                )
                                            }}
                                        >
                                            {currency.Code}
                                        </ButtonBase>
                                    </Grid>
                                )}
                            </GridContainer>
                            <GridContainer style={{ flexWrap: 'nowrap' }}>
                                <Grid item={true} className={classes.inputContainer}>
                                    <TextField
                                        inputProps={{ className: classes.inputValue }}
                                        fullWidth={true}
                                        type="number"
                                        label="Recieved"
                                        value={parsed}
                                        onChange={(e) => {
                                            const val = (e.target as HTMLInputElement).value;
                                            const parseVal = val === '' ? 0 : parseInt(val, 10);
                                            this._handleScreenChange(parseVal);
                                        }}
                                    />
                                </Grid>
                                {Currencies.map(currency =>
                                    <Grid 
                                        key={currency.Code} 
                                        item={true} 
                                        className={classes.currencyContainer} 
                                        xs={2}
                                    >
                                        <ButtonBase
                                            onClick={() => this._handleCurrencyClick(currency.Code)}
                                            classes={{
                                                root: classNames(
                                                    classes.currencyButton,
                                                    currencyRecieved === currency.Code && classes.currencyButtonActive
                                                )
                                            }}
                                        >
                                            {currency.Code}
                                        </ButtonBase>
                                    </Grid>
                                )}
                            </GridContainer>
                        </Grid>
                        {thereIsChange &&
                            <Grid item={true} xs={12}>
                                <GridContainer style={{ flexWrap: 'nowrap' }}>
                                    <Grid item={true} className={classes.inputContainer}>
                                        <TextField
                                            inputProps={{ className: classes.inputValue }}
                                            fullWidth={true}
                                            type="number"
                                            label="Change"
                                            value={-change}
                                        />
                                    </Grid>
                                    {Currencies.map(currency =>
                                        <Grid
                                            key={currency.Code} 
                                            item={true} 
                                            className={classes.currencyContainer} 
                                            xs={2}
                                        >
                                            <ButtonBase
                                                onClick={() => this._handleCurrencyChangeClick(currency.Code)}
                                                classes={{
                                                    root: classNames(
                                                        classes.currencyButton,
                                                        currencyChange === currency.Code && classes.currencyButtonActive
                                                    )
                                                }}
                                            >
                                                {currency.Code}
                                            </ButtonBase>
                                        </Grid>
                                    )}
                                </GridContainer>
                            </Grid>
                        }
                        {btns.map((btn, i) => {
                            const disabled = btns[i] === '';
                            return (
                                <Grid item={true} key={i} xs={4}>
                                    <ButtonBase
                                        disabled={disabled}
                                        onClick={() => this._handleNumberClick(btn)}
                                        className={classes.padBtn}
                                    >
                                        {btn}
                                    </ButtonBase>
                                </Grid>);
                        })}
                    </GridContainer>

                </DialogContent>
                <DialogActions>
                    <Button color="default" variant="contained" onClick={close}>Close</Button>
                    <Button color="primary" variant="contained" onClick={this._confirm}>Confirm</Button>
                </DialogActions>
            </SideDialog>
        );
    }
    private _handleScreenChange(e: number) {
        this.setState(() => {
            this._GetChange();
            return {
                amount: e.toString()
            };
        });
    }
    private _GetChange() {

        this.setState(prev => {
            const {
                parsedAmount,
                currencyRecieved,
                currencyChange } = prev;

            GetChange(this.props.order, parsedAmount, currencyRecieved, currencyChange).then(c => {
                this.setState(() => ({ loading: false, change: c }));
            });
            return { loading: true };
        });

    }

    private _handleNumberClick(btn: string) {
        switch (btn) {
            case 'c':
                if (!this.state.amount.length) { return; }
                this.setState(prev => {
                    const newAmount = prev.amount.substring(0, prev.amount.length - 1);
                    const parsed = parseFloat(newAmount);
                    const parsedAmount = (isFinite(parsed) && !isNaN(parsed) && parsed) || 0;
                    this._GetChange();
                    return ({
                        amount: newAmount,
                        parsedAmount: parsedAmount
                    });
                });
                break;
            case 'cc':
                if (!this.state.amount.length) { return; }
                this.setState(() => {
                    this._GetChange();
                    return ({
                        amount: '',
                        parsedAmount: 0
                    });
                });

                break;
            default:
                this.setState(prev => {
                    const newAmount = prev.amount + btn;
                    const parsed = parseFloat(newAmount);
                    const parsedAmount = (isFinite(parsed) && !isNaN(parsed) && parsed) || 0;
                    this._GetChange();
                    return ({
                        amount: newAmount,
                        parsedAmount: parsedAmount
                    });
                });

                break;
        }
    }

    private _handleCurrencyToPayClick(currency: string) {
        this.setState(() => {
            this._GetChange();
            return {
                currencyToPay: currency
            };
        });
    }

    private _handleCurrencyClick(currency: string) {
        this.setState(() => {
            this._GetChange();
            return {
                currencyRecieved: currency
            };
        });
    }

    private _keyDown(ev: KeyboardEvent) {
        let num = '';
        switch (ev.keyCode) {
            case 46: // delete
                if (!this.state.amount.length) { return; }
                this.setState(() => {
                    this._GetChange();
                    return ({
                        amount: '',
                        parsedAmount: 0
                    });
                });
                return;
            case 220:
            case 67: // c
            case 8: // backslash
                if (!this.state.amount.length) { return; }
                this.setState(prev => {
                    const newAmount = prev.amount.substring(0, prev.amount.length - 1);
                    const parsed = parseFloat(newAmount);
                    const parsedAmount = (isFinite(parsed) && !isNaN(parsed) && parsed) || 0;
                    this._GetChange();
                    return ({
                        amount: newAmount,
                        parsedAmount: parsedAmount
                    });
                });
                return;
            case 48: // 0
            case 96: // num 0
                num = '0';
                break;
            case 49: // 1
            case 97: // num 1
                num = '1';
                break;
            case 50: // 2
            case 98: // num 2
                num = '2';
                break;
            case 51: // 3
            case 99: // num 3
                num = '3';
                break;
            case 52: // 4
            case 100: // num 4
                num = '4';
                break;
            case 53: // 5
            case 101: // num 5
                num = '5';
                break;
            case 54: // 6
            case 102: // num 6
                num = '6';
                break;
            case 55: // 7
            case 103: // num 7
                num = '7';
                break;
            case 56: // 8
            case 104: // num 8
                num = '8';
                break;
            case 57: // 9
            case 105: // num 9
                num = '9';
                break;
            case 110: // NumpadDecimal
            case 194: // NumpadComma
            case 188: // Comma
            case 190: // Period
                num = '.';
                break;
            default:
                num = '';
                break;
        }
        this.setState(prev => {
            const newAmount = prev.amount + num;
            const parsed = parseFloat(newAmount);
            const parsedAmount = (isFinite(parsed) && !isNaN(parsed) && parsed) || 0;
            this._GetChange();
            return ({
                amount: newAmount,
                parsedAmount: parsedAmount
            });
        });
    }
    private _handleCurrencyChangeClick(currency: string) {
        this.setState(() => {
            this._GetChange();
            return {
                currencyChange: currency
            };
        });
    }

    private _confirm() {

        const {
            parsedAmount,
            currencyRecieved,
            change,
            currencyChange } = this.state;

        this.setState(() => ({ loading: true }));
        RegisterCashPayment(this.props.order, parsedAmount, currencyRecieved, change, currencyChange).then(() => {
            this.setState(() => ({ loading: false }));
            this.props.refresh();
            // TODO: close the lightbox
            this.props.close();
        }).catch(() => {
            this.setState(() => ({ loading: false }));
        });

    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        container: {
            maxWidth: 400,
            margin: 'auto'
        },
        currencyButton: {
            height: '100%',
            width: '100%',
            fontSize: 18,
            display: 'flex',
            justifyContent: 'center',
            background: theme.Colors.gray.primary.main,
            color: theme.Colors.gray.primary.contrastText,
            '&:hover': {
                background: theme.palette.primary.main,
                color: theme.palette.primary.contrastText
            }
        },
        currencyButtonActive: {
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
        },
        currencyContainer: {},
        inputContainer: {
            flex: '1 1 auto'
        },
        inputValue: {
            fontFamily: 'monospace',
            textAlign: 'right'
        },
        padBtn: {
            height: 80,
            width: '100%',
            display: 'flex',
            fontSize: 18,
            justifyContent: 'center',
            background: theme.Colors.gray.primary.main,
            color: theme.Colors.gray.primary.contrastText,
            '&:hover': {
                background: theme.palette.primary.main,
                color: theme.palette.primary.contrastText
            }
        }
    };
})(CashRegister);
