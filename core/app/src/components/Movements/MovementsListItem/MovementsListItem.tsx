import * as React from 'react';
import { InjectedIntlProps, FormattedNumber } from 'react-intl';

import ItemPreview, { Line, Lines, Thumb } from '../../ItemPreview/ItemPreview';

import { withStyles, Avatar } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, WithStyles } from '@material-ui/core/styles';
import { Movement } from 'src/@types/our-orders';
import { ArrowUpward, ArrowDownward } from '@material-ui/icons';
import * as classNames from 'classnames';
import * as moment from 'moment';

type injectedClasses = 'AmountIn' | 'AmountOut' | 'Archived' | 'container' | 'Icon' | 'Date';
export type MovementsListItemProps = InjectedIntlProps & WithStyles<injectedClasses> &
{
    movement?: Movement;
    onClick?: () => void;
};

const MovementsListItem: React.FunctionComponent<MovementsListItemProps> =
    (props) => {
        const { onClick, movement, classes } = props;

        if (!movement) {
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

        const date = moment(movement.Date).format('DD/MM/YYYY');
        const time = moment(movement.Date).format('HH:mm');
        return (
            <div
                onClick={onClick}
                className={classes.container}
            >
                <ItemPreview>
                    {movement.Amount > 0 &&
                        <Avatar className={classNames(classes.Icon, !movement.Archived && classes.AmountIn)}>
                            <ArrowDownward />
                        </Avatar>
                    }
                    {movement.Amount <= 0 &&
                        <Avatar className={classNames(classes.Icon, !movement.Archived && classes.AmountOut)}>
                            <ArrowUpward />
                        </Avatar>
                    }

                    <Lines>
                        <Line>
                            {movement.User}
                        </Line>
                        <Line>
                            <span>
                                <FormattedNumber
                                    value={movement.Amount}
                                    style="currency"
                                    currency={movement.Currency}
                                />
                            </span>
                        </Line>
                    </Lines>
                    <Lines actions={true}>
                        <Line className={classes.Date}>
                            {date}
                        </Line>
                        <Line>
                            {time}
                        </Line>
                    </Lines>
                </ItemPreview>
            </div>
        );
    };

const width = '3rem';
const height = '3rem';

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        container: {
            paddingLeft: theme.spacing.unit * 2,
            paddingRight: theme.spacing.unit * 2
        },
        Icon: {
            width,
            height,
            color: theme.Colors.gray.primary.contrastText,
            backgroundColor: theme.Colors.gray.primary.main,
        },
        AmountIn: {
            background: theme.Colors.green.primary.main,
            color: theme.Colors.green.primary.contrastText,
        },
        AmountOut: {
            background: theme.Colors.blue.primary.main,
            color: theme.Colors.blue.primary.contrastText,
        },
        Archived: {
        },
        Date: {
            color: 'black'
        }
    };
})(MovementsListItem);