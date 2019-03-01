import * as React from 'react';

import {
    injectIntl,
    InjectedIntlProps,
    FormattedMessage
} from 'react-intl';

import OrderFieldsMessages from './OrderFieldsMessages';
import OrderItemList from '../OrderItem/OrderItemList';

import ItemPreview, { Line, Lines, Thumb } from '../../ItemPreview/ItemPreview';
import { FormattedNumber } from 'react-intl';
import PaymentList from '../../Forms/Payment/List';

import { Orders } from '../../../_services';

import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { Select, FormControl, InputLabel, Grid, WithStyles, withStyles } from '@material-ui/core';
import DispatchList from '../../Forms/Dispatch/DispatchList';
import { ShippingTemplate, Order, OrderType, Person, Client, OrderItem, Roles } from 'src/@types/our-orders';
import { DateTimePicker } from 'material-ui-pickers';
import { GridContainer } from 'src/components/GridContainer/GridContainer';

import OrderClientFields from '../OrderClientFields/OrderClientFields';
import OrderShippingPersonFields from 'src/components/Orders/OrderShippingPersonFields/OrderShippingPersonFields';
import DetailGridContainer from 'src/components/DetailGridContainer/DetailGridContainer';
import DetailGridColumn from 'src/components/DetailGridColumn/DetailGridColumn';
import ClientSelect from './ClientSelect';
import { CheckBoxOutlineBlankOutlined, CheckBox } from '@material-ui/icons';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import CurrenciesField from 'src/components/CurrenciesField/CurrenciesField';
import ShopsField from 'src/components/ShopsField/ShopsField';

import {
    InjectedAuthProps,
    InjectedSettingsProps,
    InjectedShopProps,
    InjectedWarehouseProps,
    InjectedUsersProps,
    InjectedProductProps,
    InjectedCategoryProps
} from 'src/_context';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export type injectedClasses = 'cancelled' | 'cancelledIcon' | 'cancelledWrapper';

export type OrderFieldsProps =
    WithStyles<injectedClasses> &
    InjectedAuthProps &
    InjectedIntlProps &
    InjectedProductProps &
    InjectedCategoryProps &
    InjectedSettingsProps &
    InjectedShopProps &
    InjectedWarehouseProps &
    InjectedUsersProps &
    {
        current: Order;
        onChange: (changes: Partial<Order>) => void;
        refresh: () => void;
        preventEditClient?: boolean;

    };

type State = {
    shippingTemplates: ShippingTemplate[]
};
class OrderFields extends React.Component<OrderFieldsProps, State> {

    constructor(props: OrderFieldsProps) {
        super(props);
        this._handleClientChange = this._handleClientChange.bind(this);
        this._handleItemsChange = this._handleItemsChange.bind(this);

        this._handleShippingPersonChange = this._handleShippingPersonChange.bind(this);
        this._fetchShippings = this._fetchShippings.bind(this);
        this._handleShippingsSelectChange = this._handleShippingsSelectChange.bind(this);

        this.state = {
            shippingTemplates: []
        };
    }

    componentDidMount() {
        this._fetchShippings();
    }

    render() {
        const {
            props,
            props:
            {
                current,
                preventEditClient,

                onChange,
                intl,
                intl: { formatMessage },
                categoryCtx,
                productCtx,
                settingsCtx,
                settingsCtx: { Settings: { Currencies } },
                warehouseCtx,
                shopCtx,
                usersCtx: { Users },
                authCtx: { user },
                authCtx,
                classes
            }
        } = this;

        const {
            Status,
            Items,
            Note,
            Canceled,
            Client: client,
            Date: date,
            ClientId,
            Currency,
            Paid,
            Reference,
            NeedsDispatch,
            OrderType: orderType,
            UserId
        } = current;

        const needsDispatchInfos = NeedsDispatch;

        const ownOrder = (current.UserId && current.UserId) === (user && user.Id);
        const hasRights = ownOrder && IsAdminOrInRole(user, Roles.CRUD_Own_Orders) ||
            IsAdminOrInRole(user, Roles.CRUD_All_Orders);

        return (
            <DetailGridContainer>
                <DetailGridColumn>
                    <GridContainer>
                        <Grid item={true} xs={3}>
                            <TextField
                                select={true}
                                label={formatMessage(OrderFieldsMessages.orderType)}
                                fullWidth={true}
                                value={orderType || ''}
                                className={Canceled ? classes.cancelled : ''}
                                disabled={!hasRights}
                                onChange={(value) => {
                                    const v = value.target.value as string;
                                    if (v === 'Cancelled') {
                                        onChange({ Canceled: !Canceled });
                                    } else {
                                        onChange(
                                            { OrderType: v as OrderType });
                                    }
                                }}
                            >
                                {['Cart', 'Order', 'Offer'].map(v =>
                                    <MenuItem key={v} value={v}>
                                        {formatMessage(OrderFieldsMessages[v.toLowerCase()])}
                                    </MenuItem>)
                                }
                                <MenuItem key="Cancelled" value="Cancelled">
                                    <span className={classes.cancelledWrapper}>
                                        {Canceled ?
                                            <CheckBox className={classes.cancelledIcon} /> :
                                            <CheckBoxOutlineBlankOutlined
                                                className={classes.cancelledIcon}
                                            />}
                                        {formatMessage(OrderFieldsMessages.canceled)}
                                    </span>
                                </MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item={true} xs={5}>
                            <TextField
                                label={`${orderType || 'Reference'} # (${Status})`}
                                fullWidth={true}
                                className="forms-fields__title-reference-field"
                                onChange={(e) =>
                                    onChange({ Reference: e.target.value })}
                                value={Reference || ''}
                                disabled={!hasRights}
                            />
                        </Grid>
                        <Grid item={true} xs={4}>
                            <DateTimePicker
                                label="date"
                                fullWidth={true}
                                keyboard={true}
                                format="dd/MM/yyyy HH:mm"
                                mask={(value: string) =>
                                    // tslint:disable-next-line:max-line-length
                                    (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, / /, /\d/, /\d/, /\:/, /\d/, /\d/] : [])}
                                value={(
                                    date &&
                                    new Date(date))
                                }
                                onChange={(value: Date) => onChange({ Date: value })}
                                disableOpenOnEnter={true}
                                animateYearScrolling={false}
                                disabled={!hasRights}
                            />
                        </Grid>
                        <Grid item={true} xs={3}>
                            <CurrenciesField
                                settingsCtx={settingsCtx}
                                label={formatMessage(OrderFieldsMessages.currency)}
                                fullWidth={true}
                                value={current.Currency}
                                onChange={(e) => {
                                    onChange({ Currency: e.target.value });
                                }}
                                disabled={!hasRights}
                            />
                        </Grid>
                        <Grid item={true} xs={5} >
                            <ShopsField
                                shopCtx={shopCtx}
                                label={formatMessage(OrderFieldsMessages.shop)}
                                fullWidth={true}
                                value={current.ShopId || ''}
                                onChange={(e) => {
                                    onChange({ ShopId: e.target.value });
                                }}
                                disabled={!hasRights}
                            />
                        </Grid>
                        <Grid item={true} xs={4}>
                            <TextField
                                select={true}
                                label={formatMessage(OrderFieldsMessages.user)}
                                fullWidth={true}
                                value={UserId || ''}
                                disabled={!hasRights}
                                onChange={(value) => {
                                    onChange(
                                        { UserId: value.target.value });
                                }}
                            >
                                {Users.map(u => (
                                    <MenuItem key={u.Id} value={u.Id}>{u.FirstName} {u.LastName}</MenuItem>)
                                )}
                            </TextField>
                        </Grid>

                        {hasRights && <Grid item={true} xs={12}>
                            <ClientSelect
                                onChange={(value: Client) => onChange({
                                    ClientId: (value && value.Id) || undefined,
                                    Client: value && confirm('update client infos ?') ? value : client
                                })}
                                value={ClientId || ''}
                            />
                        </Grid>}

                        <Grid item={true} xs={12}>
                            <OrderClientFields
                                preventEditClient={preventEditClient}
                                current={({ ClientId: current.ClientId, Client: current.Client })}
                                onChange={this._handleClientChange}
                                intl={intl}
                                authCtx={authCtx}
                            />
                        </Grid>

                        <Grid item={true} xs={12} style={{ marginTop: '4rem' }}>
                            <OrderItemList
                                {...{
                                    productCtx,
                                    categoryCtx,
                                    settingsCtx,
                                    intl,
                                    warehouseCtx,
                                    currency: Currency || (Currencies[0] && Currencies[0].Code) || 'EUR',
                                    orderPaid: Paid
                                }}
                                list={Items || []}
                                preview={current.Items}
                                onChange={this._handleItemsChange}
                                hasRights={!!hasRights}
                            />
                        </Grid>
                    </GridContainer>
                </DetailGridColumn>
                <DetailGridColumn>
                    <GridContainer justify="center">
                        <Grid item={true} xs={12}>
                            {this._renderAmounts()}
                        </Grid>

                        {hasRights && NeedsDispatch &&
                            <React.Fragment>
                                <Grid item={true} xs={12}>
                                    {this._renderShippingsDropdown()}
                                </Grid>
                                {needsDispatchInfos &&
                                    <Grid item={true} xs={12}>
                                        <OrderShippingPersonFields
                                            intl={intl}
                                            initial={current.ShippingPerson}
                                            changes={{}}
                                            onChange={this._handleShippingPersonChange}
                                            current={current}
                                            hasRights={!hasRights}
                                        />
                                    </Grid>}
                            </React.Fragment>
                        }

                        <Grid item={true} xs={12} style={{ marginTop: '4rem' }}>
                            <PaymentList
                                {...{ settingsCtx }}
                                Currency={current.Currency}
                                PaidAmount={current.PaidAmount}
                                Total={current.Total}
                                list={current.Payments}
                                preview={current.Payments}
                                onChange={(value) => onChange({ Payments: value })}
                                hasRights={!!hasRights}
                            />
                        </Grid>
                        <Grid item={true} xs={12} style={{ marginTop: '4rem' }}>
                            <DispatchList
                                {...{
                                    intl,
                                    order: current,
                                    list: current.Dispatches || [],
                                    preview: current.Dispatches || [],
                                    onChange: (d) => onChange({ Dispatches: d }),
                                    hasRights: !!hasRights
                                }}
                            />
                        </Grid>
                        <Grid item={true} xs={12} style={{ marginTop: '4rem' }}>
                            <TextField
                                label={formatMessage(OrderFieldsMessages.note)}
                                multiline={true}
                                fullWidth={true}
                                onChange={(e) =>
                                    props.onChange({ Note: e.target.value })}
                                value={Note}
                                disabled={!hasRights}
                            />
                        </Grid>
                    </GridContainer>
                </DetailGridColumn>
            </DetailGridContainer>);
    }

    private _renderShippingsDropdown() {
        const {
            props: { current, intl },
            state: { shippingTemplates }
        } = this;

        const { ShippingTemplateId } = current;

        return (
            <FormControl fullWidth={true}>
                <InputLabel htmlFor="shipping_options">
                    {intl.formatMessage(OrderFieldsMessages.shippingOptions)}
                </InputLabel>
                <Select
                    fullWidth={true}
                    value={ShippingTemplateId || ''}
                    onChange={this._handleShippingsSelectChange}
                    inputProps={{
                        name: 'shipping_options',
                        id: 'shipping_options',
                    }}
                >
                    {shippingTemplates.map(shippingTemplate => (
                        <MenuItem key={shippingTemplate.Id} value={shippingTemplate.Id}>
                            {shippingTemplate.Title}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>);
    }
    private _handleShippingsSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const { target: { value } } = e;
        if (!value) { return; }
        const shipping = this.state.shippingTemplates.find(s => s.Id === value);
        if (!shipping) { return; }
        this.props.onChange({
            ShippingTemplateId: shipping.Id,
            ShippingTemplateName: shipping.Title
        });
    }

    private _fetchShippings() {
        return Orders.Shippings(this.props.current, 0, 100)
            .then((json) => {
                const templates = json.Values;
                this.setState(() => ({ shippingTemplates: templates }));
                return templates;
            });
    }

    private _renderAmounts() {

        const { props: { current: { Total, Tax, Delivery, Currency, PaidAmount } } } = this;

        const lines: { legend: React.ReactNode; value: React.ReactNode }[] = [
            {
                legend: (
                    <span className="forms__order-amount-text  forms__order-amount-text--total">
                        <FormattedMessage
                            id="src.components.forms.order.fields.totalAmount"
                            defaultMessage="Total"
                            description="Legend for the Total amount of the order"
                        />
                    </span>
                ),
                value: (
                    <span className="forms__order-amount-text forms__order-amount-text--total">
                        {Currency ?
                            <FormattedNumber
                                value={Total || 0}
                                style="currency"
                                currency={Currency}
                            /> : Total}
                    </span>)
            }
        ];

        if (Tax) {
            lines.push({
                legend: (
                    <span className="forms__order-amount-text">
                        <FormattedMessage
                            id="src.components.forms.order.fields.tax"
                            defaultMessage="Incl. Tax"
                            description="Legend for the Tax amount of the order"
                        />
                    </span>
                ),
                value: (
                    <span className="forms__order-amount-text">
                        {(Currency ?
                            <FormattedNumber
                                value={Tax}
                                style="currency"
                                currency={Currency}
                            /> : Tax)}
                    </span>)
            });
        }

        if (Delivery && Delivery.Final) {
            lines.push({
                legend: (
                    <span className="forms__order-amount-text">
                        <FormattedMessage
                            id="src.components.forms.order.fields.shipping"
                            defaultMessage="Incl. Shipping"
                            description="Legend for the Shipping amount of the order"
                        />
                    </span>
                ),
                value: (
                    <span className="forms__order-amount-text">
                        {(Currency ?
                            <FormattedNumber
                                value={Delivery!.Final}
                                style="currency"
                                currency={Currency}
                            /> : Delivery!.Final)}
                    </span>)
            });
        }

        // if (discount) {
        //     lines.push({
        //         legend: (
        //             <span className="forms__order-amount-text">
        //                 <FormattedMessage
        //                     id="src.components.forms.order.fields.discount"
        //                     defaultMessage="Incl. Discount"
        //                     description="Legend for the Discount amount of the order"
        //                 />
        //             </span>
        //         ),
        //         value: (
        //             <span className="order-items-fields__final-price">
        //                 <FormattedNumber
        //                     value={discount || 0}
        //                     style="currency"
        //                     currency={preview.Currency}
        //                 />
        //             </span>)
        //     });
        // }

        // if (extra) {
        //     lines.push({
        //         legend: (
        //             <span className="forms__order-amount-text">
        //                 <FormattedMessage
        //                     id="src.components.forms.order.fields.extra"
        //                     defaultMessage="Extra"
        //                     description="Legend for the Extra amount of the order"
        //                 />
        //             </span>
        //         ),
        //         value: (
        //             <span className="forms__order-amount-text">
        //                 <FormattedNumber
        //                     value={extra || 0}
        //                     style="currency"
        //                     currency={preview.Currency}
        //                 />
        //             </span>)
        //     });
        // }

        if (PaidAmount) {
            lines.push({
                legend: (
                    <span className="forms__order-amount-text forms__order-amount-text--paied-amount">
                        <FormattedMessage {...OrderFieldsMessages.paidAmount} />
                    </span>
                ),
                value: (
                    <span className="forms__order-amount-text forms__order-amount-text--paied-amount">
                        {(Currency ?
                            <FormattedNumber
                                value={PaidAmount}
                                style="currency"
                                currency={Currency}
                            /> : PaidAmount)}
                    </span>)
            });
        }

        const firstpreview = lines.filter((v, i) => i < 3);

        const secondpreview = lines.filter((v, i) => i >= 3);

        return (
            <div className="forms__order-amount">
                <ItemPreview>
                    <Lines>
                        {firstpreview.map((l, i) => <Line key={i}>{l.legend}</Line>)}
                    </Lines>
                    <Lines actions={true}>
                        {firstpreview.map((l, i) => <Line key={i}>{l.value}</Line>)}
                    </Lines>
                </ItemPreview>
                {secondpreview.length > 0 &&
                    <ItemPreview>
                        <Thumb />
                        <Lines>
                            {[0, 1, 2].map(i => secondpreview[i] ?
                                <Line key={i}>{secondpreview[i].legend}</Line> : <Line key={i} />)}
                        </Lines>
                        <Lines actions={true}>
                            {[0, 1, 2].map(i => secondpreview[i] ?
                                <Line key={i}>{secondpreview[i].value}</Line> : <Line key={i} />)}
                        </Lines>
                    </ItemPreview>
                }
            </div>
        );
    }

    private _handleClientChange(changes: { ClientId: string; Client: Person; }) {
        const { props: { current: { Client: client }, onChange } } = this;

        const finalClient = { ...client, ...changes.Client } as Client;
        const chg = {} as Partial<Order>;
        if (changes.ClientId !== undefined) {
            chg.ClientId = changes.ClientId;
        }
        chg.Client = finalClient;
        onChange(chg);
    }

    private _handleShippingPersonChange(changes: Person) {
        const { props: { current: { ShippingPerson: shippingPerson }, onChange } } = this;
        onChange({ ShippingPerson: { ...shippingPerson, ...changes } });
    }

    private _handleItemsChange(newItems: OrderItem[]) {
        const { props: { onChange } } = this;
        onChange({ Items: newItems });
    }
}
export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    return {
        cancelled: {
            color: theme.palette.grey[500]
        },
        cancelledWrapper: {
            display: 'flex',
            alignItems: 'center'
        },
        cancelledIcon: {
            marginRight: 5,
            fontSize: 20
        }
    };
})(injectIntl(OrderFields));

// Client shipping information
// {needsDispatchInfos &&
//     <Grid item={true} xs={12}>
//         <OrderShippingPersonFields
//             intl={intl}
//             initial={current.ShippingPerson}
//             changes={{}}
//             onChange={this._handleShippingPersonChange}
//             current={current}
//         />
//     </Grid>}