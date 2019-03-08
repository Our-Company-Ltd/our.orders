import { InjectedIntl } from 'react-intl';
import { OrderStatusMessages } from './OrderStatusMessages';
import { OrderStatus, Order } from 'src/@types/our-orders';

export const GetOrderStatusProgress = (order: Order) => {

    switch (order.Status) {
        case 'Canceled':
            return -1;

        case 'Done':
            return 100;

        case 'PendingPayment':
            return 33;

        case 'ToDispatch':
            return 66;

        case 'Empty':
            return 0;

        default:
            return 100;

    }
};

export const GetOrderStatusLegend = (intl: InjectedIntl, status: OrderStatus): string => {
    var messageDescriptor = OrderStatusMessages[status] ||
     { defaultMessage: status.toString(), id: `OrderStatus.${status}` };
    return intl.formatMessage(messageDescriptor);
};