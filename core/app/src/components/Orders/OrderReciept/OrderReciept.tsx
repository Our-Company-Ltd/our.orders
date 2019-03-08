import * as React from 'react';
import { InjectedShopProps } from 'src/_context';
import { Grid } from '@material-ui/core';
import { InjectedIntlProps, FormattedNumber } from 'react-intl';
import { Order, OrderItem } from 'src/@types/our-orders';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, withStyles, WithStyles } from '@material-ui/core/styles';
import * as classNames from 'classnames';

type injectedClasses =
    'headerCls' | 'BoldCls' | 'SectionCls' | 'SectionTitleCls' |
    'OrderReceipt' | 'SectionShop' | 'SectionItemsTitle' | 'SectionPaymentsTitle' | 'TextAlignRight' |
    'SectionDispatchesTitle' | 'Section' | 'Price' | 'SubSection' | 'SubItems' | 'Item' | 'OrganizationName';

export const formatPrice = (value?: number) => {
    return value ? parseFloat((Math.round(value * 100) / 100).toString()).toFixed(2) : '0';
};

export const OrderReceiptItem: React.SFC<{
    order: Order;
    orderItem: OrderItem;
}> = (props) => {
    const orderItem = props.orderItem;

    return (
        <Grid key={orderItem.UID} container={true} spacing={8}>
            <Grid item={true} xs={1}>
                {orderItem.Quantity || ''}
            </Grid>
            <Grid item={true} xs={6}>
                {orderItem.Title || ''}
            </Grid>
            <Grid item={true} xs={2} style={{flexGrow: 1, textAlign: 'right'}}>
                {formatPrice(orderItem.UnitPrice)}
            </Grid>
            <Grid item={true} xs={1} style={{flexGrow: 1, textAlign: 'right'}}>
                {formatPrice(orderItem.Price && orderItem.Price.TaxRateIncluded)}
            </Grid>
            <Grid item={true} xs={2} style={{flexGrow: 1, textAlign: 'right'}}>
                {formatPrice(orderItem.FinalPrice)}
            </Grid>

            {orderItem.Items && orderItem.Items.length ?
                orderItem.Items.map(i => (
                    <React.Fragment key={i.UID}>
                        <Grid item={true} xs={1} />
                        <Grid item={true} xs={11}>
                            - {i.Quantity || ''} {i.Title || ''}
                        </Grid>
                    </React.Fragment>))
                : undefined}

        </Grid>);
};

export const OrderReciept: React.SFC<InjectedShopProps &
    InjectedIntlProps &
    WithStyles<injectedClasses> &
{
    order: Order;
}
> = (props) => {
    const {
        order,
        order: {
            Client,
            ShopId,
            OrderType,
            Reference,
            Date: date,
            Items,
            Payments,
            Dispatches
        },
        intl,
        classes
    } = props;

    const shop = props.shopCtx.Shops.find(s => s.Id === ShopId);

    const client = Client;

    const paymentsToRender = Payments.filter(p => p.Status === 'Pending' || p.Status === 'Paid');

    return (
        <div className={classes.OrderReceipt}>
            {shop &&
                <Grid container={true}>
                    {shop.OrganizationName &&
                        <Grid
                            item={true}
                            xs={12}
                            className={
                                classNames(
                                    classes.headerCls,
                                    classes.BoldCls)}
                        >
                            <span>
                                {shop.OrganizationName}
                            </span>
                        </Grid>}
                    {shop.Address &&
                        <Grid
                            item={true}
                            xs={12}
                            className={classes.headerCls}
                        >
                            <span>
                                {shop.Address}
                            </span>
                        </Grid>}
                    {(shop.PostalCode || shop.City) &&
                        <Grid
                            item={true}
                            xs={12}
                            className={classes.headerCls}
                        >
                            {shop.PostalCode &&
                                <span className={classes.OrganizationName}>
                                    {shop.PostalCode}
                                </span>}
                            {shop.City &&
                                <span>
                                    {shop.City}
                                </span>}
                        </Grid>}
                    {(shop.State || shop.CountryIso) &&
                        <Grid
                            item={true}
                            xs={12}
                            className={classes.headerCls}
                        >
                            {shop.State &&
                                <span>
                                    {shop.State}
                                </span>}
                            {shop.CountryIso &&
                                <span>
                                    {shop.CountryIso}
                                </span>}
                        </Grid>}
                    {shop.Phone &&
                        <Grid
                            item={true}
                            xs={12}
                            className={classes.headerCls}
                        >
                            <span>
                                {shop.Phone}
                            </span>
                        </Grid>}
                    {shop.Email &&
                        <Grid
                            item={true}
                            xs={12}
                            className={classes.headerCls}
                        >
                            <span>
                                {shop.Email}
                            </span>
                        </Grid>}
                </Grid>
            }
            <Grid
                container={true}
                className={classes.SectionCls}
            >
                <Grid item={true} xs={12}>
                    {OrderType} #{Reference}
                </Grid>
                <Grid item={true} xs={12}>
                    {date && intl.formatDate(new Date(date), {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: false
                    })
                    }
                </Grid>
            </Grid>
            {client &&
                <Grid
                    container={true}
                    className={classes.SectionCls}
                >
                    {client.OrganizationName &&
                        <div className={classes.OrganizationName}>
                            {client.OrganizationName}
                        </div>}
                    {(client.FirstName || client.LastName) &&
                        <div>
                            {client.FirstName} {client.LastName}
                        </div>}
                    {client.VATNumber &&
                        <div>
                            {client.VATNumber}
                        </div>}
                </Grid>
            }
            <Grid
                container={true}
                className={classNames(classes.SectionCls, classes.SectionTitleCls)}
            >
                <Grid item={true} xs={1}>
                    Qt.
                </Grid>
                <Grid item={true} xs={6}>
                    Description
                </Grid>
                <Grid item={true} xs={2} className={classes.Price}>
                    Unit
                </Grid>
                <Grid item={true} xs={1} className={classes.Price}>
                    Tx
                </Grid>
                <Grid item={true} xs={2} className={classes.Price}>
                    Price
                </Grid>
            </Grid>
            <Grid
                container={true}
                className={classes.SectionCls}
            >
                {Items.map(item => {
                    return OrderReceiptItem({ orderItem: item, order });
                })}
            </Grid>
            <Grid
                container={true}
                className={classNames(
                    classes.SectionCls,
                    classes.BoldCls)}
            >
                <Grid item={true} xs={8}>
                    {order.Delivery && order.Delivery.Final !== 0 ? '' : 'Total'}
                </Grid>
                <Grid item={true} xs={4} className={classes.Price}>
                    <FormattedNumber
                        value={order.Price || 0}
                        style="currency"
                        currency={order.Currency}
                    />
                </Grid>
            </Grid>
            {order.Delivery && order.Delivery.Final !== 0 &&
                <React.Fragment>
                    <Grid
                        container={true}
                        className={classes.SectionCls}
                    >
                        <Grid item={true} xs={8}>
                            Shipping
                        </Grid>
                        <Grid item={true} xs={4} className={classes.Price}>
                            <FormattedNumber
                                value={order.Delivery.Final || 0}
                                style="currency"
                                currency={order.Currency}
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        container={true}
                        className={classes.SectionCls}
                    >
                        <Grid item={true} xs={8}>
                            Total
                        </Grid>
                        <Grid item={true} xs={4} className={classes.Price}>
                            <FormattedNumber
                                value={order.Total || 0}
                                style="currency"
                                currency={order.Currency}
                            />
                        </Grid>
                    </Grid>
                </React.Fragment>
            }
            {order.Tax !== 0 &&
                <Grid
                    container={true}
                    className={classes.SectionCls}
                >
                    <Grid item={true} xs={8}>
                        Included tax
                    </Grid>
                    <Grid item={true} xs={4} className={classes.TextAlignRight}>
                        <FormattedNumber
                            value={order.Tax || 0}
                            style="currency"
                            currency={order.Currency}
                        />
                    </Grid>
                </Grid>}
            {paymentsToRender.length > 0 &&
                <React.Fragment>
                    <Grid
                        container={true}
                        className={classNames(classes.SectionCls, classes.SectionTitleCls)}
                    >
                        <Grid item={true} xs={5}>
                            Payments
                        </Grid>
                        <Grid item={true} xs={3}>
                            Status
                        </Grid>
                        <Grid item={true} xs={4} className={classes.Price}>
                            Amount
                        </Grid>
                    </Grid>
                    <Grid
                        container={true}
                        className={classes.SectionCls}
                    >
                        {paymentsToRender
                            .map(payment => {
                                return (
                                    <React.Fragment key={payment.Id}>
                                        <Grid item={true} xs={5}>
                                            {payment.Title}
                                        </Grid>
                                        <Grid item={true} xs={3}>
                                            {payment.Status}
                                        </Grid>
                                        <Grid item={true} xs={4} className={classes.Price}>
                                            <FormattedNumber
                                                value={payment.Amount || 0}
                                                style="currency"
                                                currency={payment.Currency}
                                            />
                                        </Grid>
                                    </React.Fragment>
                                );
                            })}
                    </Grid>
                </React.Fragment>}
            {Dispatches.length > 0 &&
                <React.Fragment>
                    <Grid
                        container={true}
                        className={classNames(classes.SectionCls, classes.SectionTitleCls)}
                    >
                        <Grid item={true} xs={5}>
                            Dispatches
                        </Grid>
                        <Grid item={true} xs={3}>
                            Status
                        </Grid>
                        <Grid item={true} xs={4} className={classes.Price}>
                            Date
                        </Grid>
                    </Grid>
                    <Grid
                        container={true}
                        className={classes.SectionCls}
                    >
                        {Dispatches
                            .map(dispatch => {
                                return (
                                    <React.Fragment key={dispatch.Id}>
                                        <Grid item={true} xs={5}>
                                            {dispatch.Method && dispatch.Method}
                                        </Grid>
                                        <Grid item={true} xs={3}>
                                            {dispatch.Status && dispatch.Status}
                                        </Grid>
                                        <Grid item={true} xs={4} style={{ textAlign: 'right' }}>
                                            {intl.formatDate(new Date(dispatch.Date), {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric'
                                            })
                                            }
                                        </Grid>
                                    </React.Fragment>
                                );
                            })}
                    </Grid>
                </React.Fragment>}

        </div>);
};

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        headerCls: {
            textAlign: 'center'
        },
        BoldCls: {
            fontWeight: 'bold'
        },
        SectionCls: {
            padding: '0.25cm 0',
            borderBottom: '1px solid #444'
        },
        SectionTitleCls: {
            color: 'black'
        },
        OrderReceipt: {
            position: 'relative',
            fontFamily: '"Courier New", Courier, monospace',
            color: '#444',
            background: 'white',
            boxSizing: 'border-box',
            margin: '0 auto',
        },
        SectionShop: {
            color: 'black',
            textAlign: 'center'
        },
        SectionItemsTitle: {
            color: 'black',
        },
        SectionPaymentsTitle: {
            color: 'black',
        },
        SectionDispatchesTitle: {
            color: 'black',
        },
        Section: {
            padding: '0.25cm 0',
            borderBottom: '1px solid #444',
        },
        TextAlignRight: {
            textAlign: 'right',
        },
        Price: {
            flexGrow: 1,
            textAlign: 'right',
        },
        SubSection: {
            borderTop: '1px dashed #444',
        },
        SubItems: {
            width: '100%',
            paddingLeft: '0.2cm',
        },
        Item: {
            display: 'flex',
            width: '100%',
            flexWrap: 'wrap',
        },
        OrganizationName: {
            marginRight: 5
        }
    };
})(OrderReciept);