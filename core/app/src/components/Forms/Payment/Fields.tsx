import * as React from 'react';
import { FormattedNumber } from 'react-intl';

import ItemPreview, { Lines, Line, Thumb } from '../../ItemPreview/ItemPreview';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { GetPaymentStatusLegend } from '../../../_helpers/PaymentStatusHelpers';
import Grid from '@material-ui/core/Grid';
import { DateTimePicker } from 'material-ui-pickers';
import TextField from '@material-ui/core/TextField';
import PaymentListMessages from './PaymentListMessages';
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Avatar,
    IconButton,
    WithStyles,
    withStyles
} from '@material-ui/core';
import { Payment, PaymentMethod, PaymentStatus } from 'src/@types/our-orders';
import { GetPaymentMethodLegend } from 'src/_helpers/PaymentMethodHelpers';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Close, Cancel, QueryBuilder, HighlightOff, Check, Delete } from '@material-ui/icons';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import CurrenciesField from 'src/components/CurrenciesField/CurrenciesField';
import { InjectedSettingsProps } from 'src/_context';

type injectedClasses =
    'svgIcon' |
    'svgIconRemove' |
    'bold' |
    'marginRight';

export type PaymentFieldsProps =
    InjectedSettingsProps &
    WithStyles<injectedClasses> &
    {
        Total: number;
        PaidAmount: number;
        onChange: (changes: Partial<Payment>) => void;
        initial: Payment;
        preview: Payment;
        changes: Partial<Payment>;
        onRequestRemove: () => void;
        hasRights: boolean;
    };

type State = {
    open: boolean;
};
class PaymentFields extends React.Component<PaymentFieldsProps & InjectedIntlProps, State> {
    constructor(props: PaymentFieldsProps & InjectedIntlProps) {
        super(props);
        this._open = this._open.bind(this);
        this._close = this._close.bind(this);
        this._handleDelete = this._handleDelete.bind(this);

        this.state = {
            open: false
        };
    }

    render(): React.ReactElement<HTMLDivElement> {
        const initial: Partial<Payment> = this.props.initial || {};
        const changes: Partial<Payment> = this.props.changes || {};

        const current = { ...initial, ...changes };

        const { PaidAmount, Total, classes, settingsCtx, intl, hasRights } = this.props;

        const dateOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        };

        const paymentStatus =
            [
                {
                    preview: GetPaymentStatusLegend(intl, 'Pending'),
                    value: 'Pending'
                },
                {
                    preview: GetPaymentStatusLegend(intl, 'Canceled'),
                    value: 'Canceled'
                },
                {
                    preview: GetPaymentStatusLegend(intl, 'Failed'),
                    value: 'Failed'
                },
                {
                    preview: GetPaymentStatusLegend(intl, 'Paid'),
                    value: 'Paid'
                }
            ];

        const paymentMethod = [
            {
                preview: GetPaymentMethodLegend(intl, 'Electronic'),
                value: 'Electronic'
            },
            {
                preview: GetPaymentMethodLegend(intl, 'Cash'),
                value: 'Cash'
            },
            {
                preview: GetPaymentMethodLegend(intl, 'Voucher'),
                value: 'Voucher'
            }
        ];

        const date = current.Date ? intl.formatDate(new Date(current.Date), dateOptions) : '';

        const leftToPay = Math.ceil((Total - PaidAmount) * 100) / 100;

        const empty = Object.keys(changes).length === 0;

        const actionDelete = hasRights ? (
            <IconButton
                color="default"
                onClick={() => this.props.onRequestRemove()}
            >
                <Close className={classNames(classes.svgIcon, classes.svgIconRemove)} />
            </IconButton>) : null;

        const previewLine = empty ?
            (
                <ItemPreview
                    onClick={this._open}
                >
                    <Thumb loading={true} />
                    <Lines>
                        <Line loading={true} />
                        <Line loading={true} />
                    </Lines>
                </ItemPreview>
            ) : (
                <ItemPreview
                    onClick={this._open}
                >
                    <Avatar>
                        {current.Status && this._getPaymentStatusIcon(current.Status)}
                    </Avatar>
                    <Lines>
                        <Line>
                            <span className={classNames(classes.bold, classes.marginRight)}>{current.Method}</span>
                            {date && <span>{date}</span>}
                        </Line>
                        <Line>
                            {current.Reference &&
                                <span className={classes.marginRight}>
                                    {current.Reference}
                                </span>
                            }
                            {current.Method &&
                                <span>
                                    {current.Method}
                                </span>
                            }
                        </Line>
                    </Lines>
                    <Lines actions={true}>
                        <Line>
                            <span className="forms__order-payment-preview-amount">
                                <FormattedNumber
                                    value={current.Amount || 0}
                                    style="currency"
                                    currency={current.Currency}
                                />
                            </span>
                        </Line>
                        <Line>
                            {actionDelete}
                        </Line>
                    </Lines>
                </ItemPreview>
            );
        return (
            <React.Fragment>
                {previewLine}
                <Dialog open={this.state.open} onClose={this._close}>
                    <DialogTitle>Payment Information</DialogTitle>
                    <DialogContent>
                        <GridContainer>
                            <Grid item={true} xs={12}>
                                <TextField
                                    onChange={(value) =>
                                        this.props.onChange({ ...changes, Title: value.target.value })}
                                    value={current.Title || ''}
                                    label={intl.formatMessage(PaymentListMessages.title)}
                                    fullWidth={true}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={6}>
                                <TextField
                                    onChange={(value) =>
                                        this.props.onChange({ ...changes, Reference: value.target.value })}
                                    value={current.Reference || ''}
                                    label={intl.formatMessage(PaymentListMessages.reference)}
                                    fullWidth={true}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={6}>
                                <DateTimePicker
                                    fullWidth={true}
                                    keyboard={true}
                                    format="dd/MM/yyyy HH:mm"
                                    mask={(value: string) =>
                                        // tslint:disable-next-line:max-line-length
                                        (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, / /, /\d/, /\d/, /\:/, /\d/, /\d/] : [])}
                                    value={current.Date ? new Date(current.Date) : new Date()}
                                    onChange={(value: Date) =>
                                        this.props.onChange({ ...changes, Date: value ? value.toString() : undefined })}
                                    disableOpenOnEnter={true}
                                    animateYearScrolling={false}
                                    label="Date"
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={6}>
                                <FormControl fullWidth={true}>
                                    <InputLabel htmlFor="payment_method">
                                        {intl.formatMessage(PaymentListMessages.paymentMethod)}
                                    </InputLabel>
                                    <Select
                                        fullWidth={true}
                                        onChange={(value) =>
                                            this.props.onChange(
                                                { ...changes, Method: value.target.value as PaymentMethod })
                                        }
                                        value={current.Method || ''}
                                        inputProps={{
                                            name: 'payment_method',
                                            id: 'payment_method',
                                        }}
                                        disabled={!hasRights}
                                    >
                                        {paymentMethod.map(p =>
                                            <MenuItem key={p.value} value={p.value}>
                                                {p.preview}
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item={true} xs={6}>
                                <FormControl fullWidth={true}>
                                    <InputLabel htmlFor="payment_status">
                                        {intl.formatMessage(PaymentListMessages.status)}
                                    </InputLabel>
                                    <Select
                                        fullWidth={true}
                                        onChange={(value) =>
                                            this.props.onChange(
                                                { ...changes, Status: value.target.value as PaymentStatus })
                                        }
                                        value={current.Status || ''}
                                        inputProps={{
                                            name: 'payment_status',
                                            id: 'payment_status',
                                        }}
                                        disabled={!hasRights}
                                    >
                                        {paymentStatus.map(p =>
                                            <MenuItem key={p.value} value={p.value}>
                                                {p.preview}
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item={true} xs={6}>
                                <TextField
                                    fullWidth={true}
                                    inputProps={{ step: '0.01' }}
                                    type="number"
                                    onChange={(value) => {
                                        var val = (value.target as HTMLInputElement).value;
                                        var w = parseFloat(val);
                                        this.props.onChange({ ...changes, Amount: w });
                                    }}
                                    label={intl.formatMessage(PaymentListMessages.amount)}
                                    value={current.Amount || leftToPay}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={6}>
                                <CurrenciesField
                                    settingsCtx={settingsCtx}
                                    label={intl.formatMessage(PaymentListMessages.currency)}
                                    fullWidth={true}
                                    onChange={(value) =>
                                        this.props.onChange({ ...current, Currency: value.target.value })
                                    }
                                    value={current.Currency}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={12}>
                                <TextField
                                    onChange={(value) =>
                                        this.props.onChange({ ...changes, Details: value.target.value })}
                                    value={current.Details || ''}
                                    label={intl.formatMessage(PaymentListMessages.details)}
                                    fullWidth={true}
                                    multiline={true}
                                    disabled={!hasRights}
                                />
                            </Grid>
                        </GridContainer>
                    </DialogContent>
                    <DialogActions>
                        {hasRights && <Button color="secondary" variant="contained" onClick={this._handleDelete}>
                            <Delete />
                            delete
                        </Button>}
                        <Button color="default" variant="contained" onClick={this._close}>close</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>);
    }

    private _handleDelete() {
        this.props.onRequestRemove();
        this.setState(() => ({ open: false }));
    }

    private _open() {
        this.setState(() => ({ open: true }));
    }

    private _close() {
        this.setState(() => ({ open: false }));
    }
    private _getPaymentStatusIcon(paymentStatus: PaymentStatus) {
        switch (paymentStatus) {

            case 'Canceled':
                return <Cancel />;
            case 'Failed':
                return <HighlightOff />;
            case 'Paid':
                return <Check />;
            case 'Pending':
                return <QueryBuilder />;
            default:
                return;

        }
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    return {
        svgIcon: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        },
        svgIconRemove: {
            fontSize: '1rem'
        },
        bold: {
            marginRight: '.5rem',
            color: theme.palette.text.primary
        },
        marginRight: {
            marginRight: '.5rem'
        }
    };
})(injectIntl(PaymentFields));