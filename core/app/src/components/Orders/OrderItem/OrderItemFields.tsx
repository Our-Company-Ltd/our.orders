import * as React from 'react';
import { FormattedNumber, FormattedMessage } from 'react-intl';

import {
    InjectedIntlProps
} from 'react-intl';

import ItemPreview, { Lines, Line, Thumb } from '../../ItemPreview/ItemPreview';
import { InjectedWarehouseProps, InjectedSettingsProps } from '../../../_context';

import {
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    DialogContent,
    DialogActions,
    Button,
    Avatar,
    IconButton,
    WithStyles,
    withStyles
} from '@material-ui/core';

import TextField from '@material-ui/core/TextField';
import { OrderItemFieldsMessages } from './OrderItemFieldsMessages';
import { DateTimePicker } from 'material-ui-pickers';
import { OrderItem, OrderOption, Amount } from 'src/@types/our-orders';
import {
    LocalShipping, HowToVote, Close, ArrowDropUp, SubdirectoryArrowRight, ArrowDropDown
} from '@material-ui/icons';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';

type injectedClasses =
    'title' |
    'quantity' |
    'quantityActions' |
    'quantityLine' |
    'svgIcon' |
    'svgIconRemove' |
    'addSubItemBtn' |
    'svgIconSubItem' |
    'finalPrice';
export type OrderItemFieldsProps =
    WithStyles<injectedClasses> &
    InjectedIntlProps &
    InjectedWarehouseProps &
    InjectedSettingsProps &
    {
        orderPaid: boolean;
        currency: string;
        onChange: (changes: Partial<OrderItem>) => void;
        initial: OrderItem;
        preview: OrderItem;
        changes: Partial<OrderItem>;
        leaf?: boolean;
        hasRights: boolean;

        onRequestAddSubItem: () => void;
        onRequestRemove: () => void;
    };

type State = { open: boolean };

class OrderItemFields extends React.Component<OrderItemFieldsProps, State> {

    constructor(props: OrderItemFieldsProps) {
        super(props);

        this.state = { open: false };
    }

    render(): React.ReactElement<HTMLDivElement> {

        const initial: Partial<OrderItem> = this.props.initial || {};
        const changes: Partial<OrderItem> = this.props.changes || {};
        const preview: Partial<OrderItem> = this.props.preview || {};

        const {
            intl, warehouseCtx,
            orderPaid,
            currency,
            classes,
            intl: { formatMessage },
            onRequestAddSubItem,
            leaf,
            hasRights,
            settingsCtx: { Settings: { ShowTaxRateExcluded, ShowTaxRateIncluded } }
        } = this.props;

        const { open } = this.state;
        const current = { ...initial, ...preview, ...changes };
        const currentOption = current.Option || {};

        const { FinalPrice } = preview;
        const { UID, SKU, Title, Src, Description, Quantity, NeedsDispatch, DispatchInfos } = current;

        const empty = !(SKU || Title || Description);

        const isItemDispatched = DispatchInfos && (Quantity || 0) <= DispatchInfos.Quantity;

        const actionAddSubitem = (
            <Line>
                {hasRights && !leaf &&
                    <Button
                        color="default"
                        aria-label={formatMessage(OrderItemFieldsMessages.addSubitem)}
                        onClick={onRequestAddSubItem}
                        size="small"
                        className={classes.addSubItemBtn}
                    >
                        <SubdirectoryArrowRight className={classNames(classes.svgIconSubItem)} />
                        {formatMessage(OrderItemFieldsMessages.addSubitem)}
                    </Button>
                }

            </Line>);

        const actionAdd = hasRights ? (
            <Line>
                <IconButton
                    color="default"
                    aria-label="Add one"
                    onClick={() => this.props.onChange({ ...changes, Quantity: (Quantity || 0) + 1 })}
                >
                    <ArrowDropUp className={classes.svgIcon} />
                </IconButton>
            </Line>) : <Line />;

        const actionRemove = hasRights ? (
            <Line>
                <IconButton
                    color="default"
                    aria-label="Remove one"
                    onClick={
                        () => this.props.onChange({ ...changes, Quantity: Math.max(0, (Quantity || 0) - 1) })}
                >
                    <ArrowDropDown className={classes.svgIcon} />
                </IconButton>
            </Line>) : <Line />;

        const actionDelete = hasRights ? (
            <Line>
                <IconButton
                    color="default"
                    aria-label="Delete"
                    onClick={() => this.props.onRequestRemove()}
                >
                    <Close className={classNames(classes.svgIcon, classes.svgIconRemove)} />
                </IconButton>
            </Line>) : <Line />;

        const toggle = () => this.setState((prev) => ({ open: !prev.open }));
        const close = () => this.setState(() => ({ open: false }));

        // const dispatchIcon =
        //     Paid && NeedsDispatch && !isItemDispatched ?
        //         <Avatar><HowToVote /></Avatar> : Src ? <Thumb src={Src} /> : null;

        const titleLine = (
            <Line
                onClick={toggle}
                isTitle={true}
            >
                {Title &&
                    <span className={classes.title}>
                        {Title}
                    </span>
                }
            </Line>);

        const previewLine =
            empty ? (
                <ItemPreview active={open}>
                    <Lines>
                        <Line
                            empty={true}
                            onClick={toggle}
                        >
                            {formatMessage(OrderItemFieldsMessages.empty)}
                        </Line>
                        {actionAddSubitem}
                    </Lines>
                    <Lines
                        actions={true}
                        onClick={toggle}
                    >
                        <Line />
                        <Line />
                        <Line>
                            {actionDelete}
                        </Line>
                    </Lines>
                </ItemPreview>) :
                (
                    <ItemPreview active={open}>
                        {orderPaid && NeedsDispatch && !isItemDispatched && <Avatar><HowToVote /></Avatar>}
                        {orderPaid && NeedsDispatch && isItemDispatched && <Avatar><LocalShipping /></Avatar>}
                        {orderPaid && !NeedsDispatch && Src ? <Thumb src={Src} /> : null}
                        <Lines className={classes.quantityActions}>
                            <Line className={classes.quantityLine}>
                                {actionAdd}
                                <span className={classes.quantity}> {Quantity || 0}</span>
                                {actionRemove}
                            </Line>
                        </Lines >
                        <Lines>
                            {current.Option ? titleLine : <Line />}
                            {current.Option ?
                                <Line>
                                    <span>
                                        {`${current.Option.Title || ''} `}
                                        {`${current.Option.Value || ''} `}
                                    </span>
                                </Line> : titleLine}
                            {actionAddSubitem}
                        </Lines>
                        <Lines
                            actions={true}
                            onClick={toggle}
                        >
                            <Line>
                                {FinalPrice &&
                                    <span className={classes.finalPrice}>
                                        <FormattedNumber
                                            value={FinalPrice}
                                            style="currency"
                                            currency={currency}
                                        />
                                    </span>}
                            </Line>
                            <Line>
                                {actionDelete}
                            </Line>
                        </Lines>
                    </ItemPreview>
                );

        return (
            <React.Fragment>
                <div>
                    {previewLine}
                </div>
                <SideDialog
                    open={open}
                    onClose={close}
                >
                    <DialogContent>
                        <GridContainer spacing={8}>
                            <Grid item={true} xs={12}>
                                <ItemPreview>
                                    <Lines>
                                        <Line>
                                            <GridContainer spacing={8}>
                                                <Grid item={true} xs={9}>
                                                    <TextField
                                                        label={intl.formatMessage(OrderItemFieldsMessages.title)}
                                                        value={Title}
                                                        fullWidth={true}
                                                        onChange={(e) => {
                                                            this.props.onChange({ ...changes, Title: e.target.value });
                                                        }}
                                                        disabled={!hasRights}
                                                    />
                                                </Grid>
                                                <Grid item={true} xs={3}>
                                                    <TextField
                                                        label={intl.formatMessage(OrderItemFieldsMessages.sku)}
                                                        value={SKU}
                                                        fullWidth={true}
                                                        onChange={(e) => {
                                                            this.props.onChange({ ...changes, SKU: e.target.value });
                                                        }}
                                                        disabled={!hasRights}
                                                    />
                                                </Grid>
                                            </GridContainer>
                                        </Line>
                                    </Lines>
                                </ItemPreview>
                            </Grid>
                            <Grid item={true} xs={3}>
                                <TextField
                                    label={intl.formatMessage(OrderItemFieldsMessages.basePrice)}
                                    value={(current.Price && current.Price.Base) || 0}
                                    inputProps={{ step: '0.01' }}
                                    type="number"
                                    fullWidth={true}
                                    onChange={(e) => {
                                        const val = (e.target as HTMLInputElement).value;
                                        const Base = val === '' ? 0 : parseFloat(val);
                                        this._changeAmount({ Base });
                                    }}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={3}>
                                {ShowTaxRateIncluded &&
                                    <TextField
                                        label={intl.formatMessage(OrderItemFieldsMessages.includedTaxRate)}
                                        value={(current.Price && current.Price.TaxRateIncluded) || 0}
                                        type="number"
                                        inputProps={{ step: '0.01' }}
                                        fullWidth={true}
                                        onChange={(e) => {
                                            const val = (e.target as HTMLInputElement).value;
                                            const TaxRateIncluded = val === '' ? 0 : parseFloat(val);
                                            this._changeAmount({ TaxRateIncluded });
                                        }}
                                        disabled={!hasRights}
                                    />
                                }
                            </Grid>
                            <Grid item={true} xs={3}>
                                {ShowTaxRateExcluded &&
                                    <TextField
                                        label={intl.formatMessage(OrderItemFieldsMessages.excludedTaxRate)}
                                        value={(current.Price && current.Price.TaxRateExcluded) || 0}
                                        type="number"
                                        fullWidth={true}
                                        onChange={(e) => {
                                            const val = (e.target as HTMLInputElement).value;
                                            const TaxRateExcluded = val === '' ? 0 : parseFloat(val);
                                            this._changeAmount({ TaxRateExcluded });
                                        }}
                                        disabled={!hasRights}
                                    />
                                }
                            </Grid>
                            <Grid item={true} xs={12}>
                                <TextField
                                    multiline={true}
                                    fullWidth={true}
                                    onChange={
                                        (value) => this.props.onChange({ ...changes, Description: value.target.value })}
                                    value={Description}
                                    label={this.props.intl.formatMessage(OrderItemFieldsMessages.description)}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={2}>
                                <TextField
                                    label={intl.formatMessage(OrderItemFieldsMessages.OptionId)}
                                    value={currentOption.OptionId || ''}
                                    fullWidth={true}
                                    onChange={(e) => {
                                        this._changeOption(
                                            currentOption,
                                            { OptionId: e.target.value }
                                        );
                                    }}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={3}>
                                <TextField
                                    label={intl.formatMessage(OrderItemFieldsMessages.optionsTitle)}
                                    value={currentOption.Title || ''}
                                    fullWidth={true}
                                    onChange={(e) => {
                                        this._changeOption(
                                            currentOption,
                                            { Title: e.target.value }
                                        );
                                    }}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={3}>
                                <TextField
                                    label={intl.formatMessage(OrderItemFieldsMessages.optionsValue)}
                                    value={currentOption.Value || ''}
                                    inputProps={{ step: '0.01' }}
                                    fullWidth={true}
                                    onChange={(e) => {
                                        this._changeOption(
                                            currentOption,
                                            { Value: e.target.value }
                                        );
                                    }}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={4}>
                                <TextField
                                    label={
                                        intl.formatMessage(OrderItemFieldsMessages.optionsExtraPrice)
                                    }
                                    value={currentOption.ExtraPrice || 0}
                                    type="number"
                                    inputProps={{ step: '0.01' }}
                                    fullWidth={true}
                                    onChange={(e) => {
                                        const val = (e.target as HTMLInputElement).value;
                                        const ExtraPrice = val === '' ? 0 : parseFloat(val);
                                        this._changeOption(
                                            currentOption,
                                            { ExtraPrice }
                                        );
                                    }}
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!NeedsDispatch}
                                            onChange={(e) =>
                                                this.props.onChange({ ...changes, NeedsDispatch: e.target.checked })}
                                            color="primary"
                                            disabled={!hasRights}
                                        />}
                                    label={intl.formatMessage(OrderItemFieldsMessages.needsDispatch)}
                                />
                            </Grid>
                            {UID && <Grid item={true} xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!DispatchInfos}
                                            onChange={(e) =>
                                                this.props.onChange({
                                                    ...changes,
                                                    DispatchInfos: e.target.checked ? (current.DispatchInfos || {
                                                        Warehouse: warehouseCtx.Warehouses[0].Id,
                                                        Date: new Date().toISOString(),
                                                        Quantity: current.Quantity || 0
                                                    }) : undefined
                                                })
                                            }
                                            color="primary"
                                            disabled={!hasRights}
                                        />}
                                    label={formatMessage(OrderItemFieldsMessages.dispatched)}
                                />
                            </Grid>}
                            {UID && DispatchInfos &&
                                <React.Fragment>
                                    <Grid item={true} xs={3}>
                                        <FormControl fullWidth={true}>
                                            <InputLabel htmlFor="shipping_options">
                                                {formatMessage(OrderItemFieldsMessages.dispatchWareHouse)}
                                            </InputLabel>
                                            <Select
                                                fullWidth={true}
                                                value={DispatchInfos.Warehouse || ''}
                                                onChange={(value) => this.props.onChange({
                                                    ...changes,
                                                    DispatchInfos: {
                                                        ...DispatchInfos,
                                                        Warehouse: value.target.value
                                                    }
                                                })}
                                                inputProps={{
                                                    name: 'shipping_options',
                                                    id: 'shipping_options',
                                                }}
                                                disabled={!hasRights}
                                            >
                                                {warehouseCtx.Warehouses.map(w => (
                                                    <MenuItem key={w.Id} value={w.Id}>
                                                        {w.Name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item={true} xs={3}>
                                        <DateTimePicker
                                            label="Dispatch date"
                                            fullWidth={true}
                                            keyboard={true}
                                            format="dd/MM/yyyy HH:mm"
                                            mask={(value: string) =>
                                                // tslint:disable-next-line:max-line-length
                                                (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, / /, /\d/, /\d/, /\:/, /\d/, /\d/] : [])}
                                            value={(
                                                DispatchInfos.Date &&
                                                new Date(DispatchInfos.Date))
                                                || new Date()
                                            }
                                            onChange={(value: Date) => {
                                                this.props.onChange(
                                                    {
                                                        ...changes,
                                                        DispatchInfos: {
                                                            ...DispatchInfos,
                                                            Date: value
                                                        }
                                                    }
                                                );
                                            }}
                                            disabled={!hasRights}
                                            disableOpenOnEnter={true}
                                            animateYearScrolling={false}
                                        />

                                    </Grid>
                                    <Grid item={true} xs={3}>
                                        <TextField
                                            value={DispatchInfos.Quantity || 0}
                                            fullWidth={true}
                                            label={formatMessage(OrderItemFieldsMessages.dispatchQuantity)}
                                            type="number"
                                            onChange={(e) => {
                                                var val = (e.target as HTMLInputElement).value;
                                                var q = val === '' ? 0 : parseInt(val, 10);
                                                this.props.onChange({
                                                    ...changes,
                                                    DispatchInfos: {
                                                        ...DispatchInfos,
                                                        Quantity: q
                                                    }
                                                });
                                            }}
                                            disabled={!hasRights}
                                        />
                                    </Grid>
                                </React.Fragment>
                            }
                        </GridContainer>
                    </DialogContent>
                    <DialogActions>

                        <Button
                            size="small"
                            color="default"
                            variant="contained"
                            onClick={close}
                        >
                            <FormattedMessage {...OrderItemFieldsMessages.close} />
                        </Button>
                    </DialogActions>
                </SideDialog>
            </React.Fragment>);
    }
    private _changeOption(currentOption: OrderOption, change: Partial<OrderOption>) {

        this.props.onChange({
            ...this.props.changes,
            Option: { ...currentOption, ...change }
        });
    }

    private _changeAmount(amount: Partial<Amount>) {
        const initial: Partial<OrderItem> = this.props.initial || {};
        const changes: Partial<OrderItem> = this.props.changes || {};

        const current = { ...initial, ...changes };

        const price = current.Price || { Base: 0, Extra: 0, TaxRateExcluded: 0, TaxRateIncluded: 0, Tax: 0, Final: 0 };

        this.props.onChange({ ...changes, Price: { ...price, ...amount } });
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    return {
        title: {
            color: theme.Colors.white.primary.dark
        },
        quantity: {
            display: 'block',
            minWidth: '1rem',
            fontVariant: 'tabular-nums',
            fontWeight: 'bold',
            color: theme.Colors.white.primary.dark
        },
        quantityActions: {
            flexGrow: 0,
            flexShrink: 0,
            textAlign: 'center',
            overflow: 'visible',
            marginRight: '1rem'
        },
        quantityLine: {
            position: 'relative',
            textAlign: 'center',
            overflow: 'visible'
        },
        addSubItemBtn: {
            fontSize: '0.7rem',
            textTransform: 'none',
            padding: '2px'
        },
        svgIcon: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        },
        svgIconRemove: {
            fontSize: '1rem'
        },
        svgIconSubItem: {
            fontSize: '1rem'
        },
        finalPrice: {
            color: 'black',
            fontVariant: 'tabular-nums'
        }
    };
})(OrderItemFields);