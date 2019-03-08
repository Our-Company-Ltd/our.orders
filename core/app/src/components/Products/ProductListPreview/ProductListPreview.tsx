import * as React from 'react';
import ColorHash from 'color-hash';

import { InjectedSettingsProps, InjectedWarehouseProps } from '../../../_context';
import { ProductPreview } from 'src/@types/our-orders';
import { WithStyles, IconButton, withStyles } from '@material-ui/core';
import { Star, StarBorder, CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';

export type injectedClasses =
    'container' |
    'figure' |
    'image' |
    'text' |
    'title' |
    'action';

type ProductListPreviewProps =
    InjectedSettingsProps &
    InjectedWarehouseProps &
    InjectedSettingsProps &
    WithStyles<injectedClasses> &
    {
        product: ProductPreview;
        onSelect?: () => void;
        onFavorite?: () => void;
        onClick: () => void;
        selected?: boolean;
    };

const colorHash = new ColorHash();
class ProductListPreview extends React.Component<ProductListPreviewProps> {
    constructor(props: ProductListPreviewProps) {
        super(props);
    }

    render() {
        const { onSelect, onClick, onFavorite, product: { Id, Src, Title, Favorite }, classes, selected } = this.props;

        return (
            <div className={classes.container}>
                <figure
                    className={classes.figure}
                    style={{ backgroundColor: colorHash.hex(Id) }}
                    onClick={onClick}
                >
                    {Src && <img className={classes.image} src={`${Src}?width=500`} />}
                </figure>
                <div className={classes.text}>
                    <span className={classes.title}>
                        {Title}
                    </span>
                    <span className={classes.action}>
                        {onFavorite &&
                            <IconButton onClick={onFavorite}>
                                {Favorite ? <Star /> : <StarBorder />}
                            </IconButton>
                        }
                        {onSelect &&
                            <IconButton onClick={onSelect}>
                                {selected ? <CheckBox /> : <CheckBoxOutlineBlank />}
                            </IconButton>
                        }
                    </span>
                </div>
            </div>);
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        margin: theme.spacing.unit
    },
    figure: {
        paddingBottom: '100%',
        position: 'relative'
    },
    title: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    image: {
        overflow: 'hidden',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    text: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    action: {
    }
})
)(ProductListPreview);