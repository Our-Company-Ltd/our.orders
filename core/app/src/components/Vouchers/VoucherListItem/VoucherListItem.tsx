import * as React from 'react';
import { InjectedIntlProps, FormattedNumber, FormattedDate } from 'react-intl';
import ItemPreview, { Line, Lines, Thumb } from '../../ItemPreview/ItemPreview';

import { withStyles, Avatar } from '@material-ui/core';
import { VoucherIconStyles, VoucherIconClasses } from '../VoucherIcons';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, WithStyles } from '@material-ui/core/styles';
import { Voucher } from 'src/@types/our-orders';
import { Timelapse, CheckCircle, Block } from '@material-ui/icons';
import * as classNames from 'classnames';

type injectedClasses = VoucherIconClasses | 'container';
export type VoucherListItemProps = InjectedIntlProps & WithStyles<injectedClasses> &
{
    classNames?: string[];
    voucher?: Voucher;
    onClick?: () => void;
};

export const VoucherListItem: React.FunctionComponent<VoucherListItemProps> =
    (props) => {
        const { onClick, voucher, classes } = props;

        const cls = ['order-list-item', 'order-list-item__status'];
        if (props.classNames) {
            cls.push(...props.classNames);
        }
      
        if (!voucher) {
            return (
                <div className={classes.container}>
                    <ItemPreview >
                        <Thumb loading={true} />
                        <Lines>
                            <Line loading={true} />
                            <Line loading={true} />
                        </Lines>
                    </ItemPreview>
                </div>
            );
        }

        return (
            <div
                onClick={onClick}
                className={classes.container}
            >
                <ItemPreview>
                    {voucher.Valid &&
                        <Avatar className={classNames(classes.Initial)}>
                            <CheckCircle />
                        </Avatar>
                    }
                    {!voucher.Used && voucher.Expired &&
                        <Avatar className={classNames(classes.Used)}>
                            <Timelapse />
                        </Avatar>
                    }
                    {voucher.Used &&
                        <Avatar className={classNames(classes.Expired)}>
                            <Block />
                        </Avatar>
                    }
                    <Lines>
                        <Line>
                            {voucher.Code}
                        </Line>
                        <Line>
                            <span>
                                <FormattedNumber
                                    value={voucher.Value}
                                    style="currency"
                                    currency={voucher.Currency}
                                />
                            </span>/
                            <span>
                                <FormattedNumber
                                    value={voucher.InitialValue}
                                />
                            </span>
                        </Line>
                        <Line>
                            {voucher.Expiration &&
                                <React.Fragment>
                                    <span>Expiration date: </span>
                                    <FormattedDate
                                        value={` ${new Date(voucher.Expiration)}`}
                                        year="2-digit"
                                        month="numeric"
                                        day="numeric"
                                    />
                                </React.Fragment>}

                        </Line>
                    </Lines>
                </ItemPreview>
            </div>
        );
    };

const width = '3rem';
const height = '3rem';

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    const iconStyles = VoucherIconStyles(theme);
    return {
        container: {
            paddingLeft: theme.spacing.unit * 2,
            paddingRight: theme.spacing.unit * 2
        },
        Initial: {
            ...iconStyles.Initial,
            width,
            height
        },
        Canceled: {
            ...iconStyles.Canceled,
            width,
            height
        },
        Used: {
            ...iconStyles.Used,
            width,
            height
        },
        Expired: {
            ...iconStyles.Expired,
            width,
            height
        }
    };
})(VoucherListItem);