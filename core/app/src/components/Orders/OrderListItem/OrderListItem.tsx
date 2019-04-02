import * as React from 'react';
import { FormattedNumber, FormattedDate, InjectedIntlProps, FormattedMessage } from 'react-intl';

import ItemPreview, { Line, Lines, Thumb } from '../../ItemPreview/ItemPreview';
import PersonPreview from '../../PersonPreview';
import classNames from 'classnames';

import { LocalShipping, Check, Payment, ShoppingCart, Block, Assignment, HowToVote } from '@material-ui/icons';
import { GetOrderStatusLegend } from 'src/_helpers/OrderStatus';
import { withStyles, Avatar } from '@material-ui/core';
import { OrderIconStyles, OrderIconClasses } from '../OrderIcons';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, WithStyles } from '@material-ui/core/styles';
import { Order } from 'src/@types/our-orders';

type injectedClasses = OrderIconClasses | 'container';
export type OrderListItemProps = InjectedIntlProps & WithStyles<injectedClasses> &
{
    classNames?: string[];
    order?: Order;
    onClick?: () => void;
};

export const OrderListItem: React.FunctionComponent<OrderListItemProps> =
    (props) => {
        const { onClick, order, classes } = props;

        if (!order) {
            return (
                <div className={classes.container}>
                    <ItemPreview>
                        <Thumb loading={true} />
                        <Lines>
                            <Line loading={true} />
                            <Line loading={true} />
                        </Lines>
                    </ItemPreview>
                </div>
            );
        }

        const client = order.Client;

        const city = client!.City || undefined;

        const total = order.Total;

        const paidDate = order.Payments
            .filter(p => p.Status === 'Paid')
            .map(p => new Date(p.Date))
            .sort()
            .pop();

        const dispatchDate = order.Dispatches
            .map(p => new Date(p.Date))
            .sort()
            .pop();

        const getSubtitle = () => {
            if (order.Type !== 'order') { return null; }
            switch (order.Status) {
                case 'Canceled':
                    return (
                        <React.Fragment>
                            <span className="order-list-item__status">
                                {GetOrderStatusLegend(props.intl, order.Status)}
                            </span>
                        </React.Fragment>
                    );
                case 'Done':
                    return (
                        <React.Fragment>
                            <span className="order-list-item__status">
                                {GetOrderStatusLegend(props.intl, order.Status)}
                            </span>
                            {paidDate &&
                                <span className="order-list-item__paid-date">
                                    <FormattedMessage
                                        id="src.views.orders.orderListItem.paidDatePrefix"
                                        defaultMessage=" paid on: "
                                        description="Prefix text for date when order paid"
                                    />
                                    <FormattedDate value={new Date(paidDate)} />
                                </span>
                            }
                            {dispatchDate &&
                                <span className="order-list-item__dispatch-date">
                                    <FormattedMessage
                                        id="src.views.orders.orderListItem.dispatchedPrefix"
                                        defaultMessage=" dispatched on: "
                                        description="Prefix text for dispatched date"
                                    />
                                    <FormattedDate value={new Date(dispatchDate)} />
                                </span>
                            }
                        </React.Fragment>
                    );

                case 'PendingPayment':
                    return (
                        <React.Fragment>
                            <span className="order-list-item__status">
                                {GetOrderStatusLegend(props.intl, order.Status)}
                            </span>
                        </React.Fragment>
                    );

                case 'ToDispatch':
                    return (
                        <React.Fragment>
                            <span className="order-list-item__status">
                                {GetOrderStatusLegend(props.intl, order.Status)}
                            </span>
                            {paidDate &&
                                <span className="order-list-item__paid-date">
                                    paid on: <FormattedDate value={new Date(paidDate)} />
                                </span>
                            }
                        </React.Fragment>
                    );

                case 'Empty':
                    return (
                        <React.Fragment>
                            <span className="order-list-item__status">
                                {GetOrderStatusLegend(props.intl, order.Status)}
                            </span>
                        </React.Fragment>
                    );

                default:
                    return 100 as never;

            }
        };

        return (
            <div
                onClick={onClick}
                className={classes.container}
            >
                <ItemPreview>
                    {order.OrderType === 'Cart' &&
                        <Avatar className={classNames(classes.Cart)}>
                            <ShoppingCart />
                        </Avatar>
                    }
                    {order.OrderType === 'Order' && order.Status === 'Empty' &&
                        <Avatar className={classNames(classes.Empty)} />

                    }
                    {order.OrderType === 'Order' && order.Status === 'Canceled' &&
                        <Avatar className={classNames(classes.Cancelled)}>
                            <Block />
                        </Avatar>
                    }
                    {order.OrderType === 'Order' && order.Status === 'PendingPayment' &&
                        <Avatar className={classNames(classes.PendingPayment)}>
                            <Payment />
                        </Avatar>
                    }
                    {order.OrderType === 'Order' && order.Status === 'ToDispatch' &&
                        <Avatar className={classNames(classes.ToDispatch)}>
                            <HowToVote />
                        </Avatar>}

                    {order.OrderType === 'Order' && order.Status === 'Dispatching' &&
                        <Avatar className={classNames(classes.Dispatching)}>
                            <LocalShipping />
                        </Avatar>}
                    {order.OrderType === 'Order' && order.Status === 'Done' &&
                        <Avatar className={classNames(classes.Done)}>
                            <Check />
                        </Avatar>}

                    {order.OrderType === 'Offer' &&
                        <Avatar className={classNames(classes.Offer)}>
                            <Assignment />
                        </Avatar>}
                    <Lines>
                        <Line isTitle={true}>
                            {order.Reference}
                        </Line>
                        <Line>
                            {client && <PersonPreview person={client} />}
                            {city && <span>, {city}</span>}
                        </Line>
                        <Line>
                            {getSubtitle()}
                        </Line>
                    </Lines>
                    <Lines actions={true}>
                        <Line isTitle={true}>
                            {total && order.Currency &&
                                    <FormattedNumber
                                        value={total}
                                        style="currency"
                                        currency={order.Currency}
                                    />
                            }
                        </Line>
                        <Line>
                            {order.Date &&
                                    <FormattedDate
                                        value={new Date(order.Date)}
                                        year="2-digit"
                                        month="numeric"
                                        day="numeric"
                                    />
                            }
                        </Line>
                        <Line />
                    </Lines>
                </ItemPreview>
            </div>
        );
    };

const width = '3rem';
const height = '3rem';

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    const iconStyles = OrderIconStyles(theme);
    return {
        container: {
            paddingLeft: theme.spacing.unit * 2,
            paddingRight: theme.spacing.unit * 2
        },
        Empty: {
            ...iconStyles.Empty,
            width,
            height
        },
        Cancelled: {
            ...iconStyles.Cancelled,
            width,
            height
        },
        PendingPayment: {
            ...iconStyles.PendingPayment,
            width,
            height
        },
        ToDispatch: {
            ...iconStyles.ToDispatch,
            width,
            height
        },
        Dispatching: {
            ...iconStyles.Dispatching,
            width,
            height
        },
        Done: {
            ...iconStyles.Done,
            width,
            height
        },
        Offer: {
            ...iconStyles.Offer,
            width,
            height
        },
        Cart: {
            ...iconStyles.Cart,
            width,
            height
        }
    };
})(OrderListItem);