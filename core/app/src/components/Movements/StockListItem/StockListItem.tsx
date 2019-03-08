import * as React from 'react';

import ItemPreview, { Line, Lines } from '../../ItemPreview/ItemPreview';

import { withStyles, Avatar } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, WithStyles } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import { StockUnitWarehouseResult } from 'src/_services';
import { InjectedProductProps } from 'src/_context/Product';

type injectedClasses = 'container' | 'Icon' | 'Danger' | 'Warning' | 'Good';
export type StockListItemProps =
    InjectedProductProps & WithStyles<injectedClasses> &
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
    {
        product?: StockUnitWarehouseResult;
        title?: string;
    };

const StockListItem: React.FunctionComponent<StockListItemProps> =
    (props) => {
        const { product, classes, productCtx, title, ...divProps } = props;

        if (!product) {
            return null;
        }

        return (
            <div {...divProps} className={classNames(divProps.className, classes.container)}>
                <ItemPreview>
                    <Avatar
                        className={classNames(
                            classes.Icon,
                            product.Stock === 0 && classes.Danger,
                            product.Stock && product.Stock <= 10 && classes.Warning,
                            product.Stock && product.Stock > 10 && classes.Good,
                        )}
                    >
                        {product.Stock}
                    </Avatar>
                    <Lines>
                        <Line>
                            {product.SKU}: ({title})
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
            fontSize: '1rem'
        },
        Danger: {
            color: theme.Colors.red.primary.contrastText,
            backgroundColor: theme.Colors.red.primary.main,
            fontSize: '1rem'
        },
        Warning: {
            color: theme.Colors.orange.primary.contrastText,
            backgroundColor: theme.Colors.orange.primary.main,
            fontSize: '1rem'
        },
        Good: {
            color: theme.Colors.green.primary.contrastText,
            backgroundColor: theme.Colors.green.primary.main,
            fontSize: '1rem'
        }
    };
})(StockListItem);