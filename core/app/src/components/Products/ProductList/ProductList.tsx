import * as React from 'react';
import { Products } from '../../../_services';

import { InjectedIntlProps } from 'react-intl';

import { InjectedSettingsProps } from '../../../_context/Settings';

import * as classNames from 'classnames';
import { InjectedWarehouseProps } from '../../../_context';
import { Product, Category, ProductPreview } from 'src/@types/our-orders';
import { InjectedCategoryProps } from 'src/_context/Category';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Grid, ListItem, ListItemText, List, TextField } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, withStyles, WithStyles, withTheme, WithTheme } from '@material-ui/core/styles';
import { InjectedProductProps } from 'src/_context/Product';
import ProductListPreview from '../ProductListPreview/ProductListPreview';
import { AutoSizer, Grid as VirtualizedGrid } from 'react-virtualized';

export type injectedClasses =
    'containerCls' |
    'menu' |
    'productsContainer' |
    'menuContainer' |
    'productsInner' |
    'menuItem' |
    'menuItemLast' |
    'categoryCount' |
    'categoryCountActive' |
    'menuItemActive';

export type ProductListProps =
    WithStyles<injectedClasses> &
    WithTheme &
    InjectedCategoryProps &
    InjectedIntlProps &
    InjectedProductProps &
    InjectedSettingsProps &
    InjectedWarehouseProps &
    {
        onSelect?: (product: Product) => void;
        showFavorite?: boolean;
        onClick: (product: Product) => void;
        selectedIds?: string[];
    };

type State = {
    category?: Category;
    list: ProductPreview[];
    query?: string;
};

const COL_NUMBER = 4;

export class ProductList extends React.Component<ProductListProps, State> {
    constructor(props: ProductListProps) {
        super(props);
        this.state = {
            list: []
        };
    }
    render() {
        const {
            categoryCtx,
            productCtx: { products },
            classes
        } = this.props;
        const {
            category,
            query
        } = this.state;

        const list = this._getList();

        return (
            <GridContainer className={classes.containerCls} spacing={0}>
                <Grid
                    item={true}
                    className={classes.menuContainer}
                >
                    <List
                        className={classNames(classes.menu)}
                    >
                        <ListItem
                            button={true}
                            onClick={() => this.setState(() => ({ category: undefined }))}
                            className={
                                classNames(
                                    classes.menuItem,
                                    category === undefined && classes.menuItemActive
                                )
                            }
                        >
                            <ListItemText>All</ListItemText>
                            <span
                                className={
                                    classNames(
                                        classes.categoryCount,
                                        category === undefined && classes.categoryCountActive
                                    )
                                }
                            >
                                {products
                                    .filter(p => this._filterQuery(query)(p))
                                    .length}
                            </span>
                        </ListItem>
                        {categoryCtx.Categories.map(c =>
                            <ListItem
                                key={`category-${c.Id}`}
                                button={true}
                                onClick={() => this._setCategory(c)}
                                className={
                                    classNames(
                                        classes.menuItem,
                                        category === c && classes.menuItemActive
                                    )
                                }
                            >
                                <ListItemText>{c.Title}</ListItemText>
                                <span className={classes.categoryCount}>
                                    {products
                                        .filter(p => (p.Categories && p.Categories.indexOf(c.Id) >= 0))
                                        .filter(p => this._filterQuery(query)(p))
                                        .length}
                                </span>
                            </ListItem>
                        )}
                        <ListItem
                            key={`search`}
                            className={
                                classNames(
                                    classes.menuItem,
                                    query && classes.menuItemActive,
                                    classes.menuItemLast
                                )
                            }
                        >
                            <TextField
                                label="Search"
                                value={query || ''}
                                type="search"
                                fullWidth={true}
                                onChange={(e) => {
                                    var val = (e.target as HTMLInputElement).value;
                                    this.setState(() => ({ query: val }));
                                }}
                            />
                        </ListItem>
                    </List>
                </Grid>
                <Grid
                    item={true}
                    className={classes.productsContainer}
                >
                    <div className={classes.productsInner}>
                        <AutoSizer>
                            {({ width, height }) => {
                                const w = width - 20;
                                return <VirtualizedGrid
                                    columnCount={COL_NUMBER}
                                    columnWidth={Math.floor(w / COL_NUMBER)}
                                    cellRenderer={(cellRendererProps) =>
                                        this._cellRenderer(cellRendererProps, list)}
                                    // className={styles.collection}
                                    height={height}
                                    rowCount={Math.ceil(list.length / COL_NUMBER)}
                                    rowHeight={Math.floor(w / COL_NUMBER) + 30}
                                    // scrollToCell={scrollToCell}
                                    width={width}
                                    style={{ outline: 'none' }}
                                />;
                            }}
                        </AutoSizer>
                    </div>
                </Grid>
            </GridContainer>);
    }
    private _filterQuery(query?: string) {
        return (p: ProductPreview) => {
            if (!query) { return true; }
            var elts = query.split(' ');

            return elts.every(e =>
                p.Title.toLowerCase().indexOf(e.toLowerCase()) >= 0 ||
                (p.SKU !== undefined && p.SKU.toLowerCase().indexOf(e.toLowerCase()) >= 0)
            );
        };
    }
    private _getList() {
        const {
            category,
            query
        } = this.state;
        const { productCtx: { products } } = this.props;
        const compare = (a: ProductPreview, b: ProductPreview) => {
            if (a.Favorite !== b.Favorite) {
                return a.Favorite ? -1000 : 1000;
            }
            if (!a.Title || !b.Title) {
                return a.Title ? -1 : 0;
            }
            return a.Title.localeCompare(b.Title);
        };

        return products
            .filter(p => !category || (p.Categories && p.Categories.indexOf(category.Id) >= 0))
            .filter(p => this._filterQuery(query)(p))
            .sort(compare);
    }
    private _cellRenderer(
        cellRendererProps: {
            columnIndex: number, // Horizontal (column) index of cell
            isScrolling: boolean, // The Grid is currently being scrolled
            isVisible: boolean,   // This cell is visible within the grid (eg it is not an overscanned cell)
            key: string,         // Unique key within array of cells
            rowIndex: number,    // Vertical (row) index of cell
            style: React.CSSProperties       // Style object to be applied to cell (to position it)
        },
        list: ProductPreview[]
    ) {
        const { columnIndex, rowIndex, style, key, isVisible } = cellRendererProps;
        const index = rowIndex * COL_NUMBER + columnIndex;
        const p = list[index];
        if (!p) { return null; }

        const {
            settingsCtx, warehouseCtx, onSelect,
            productCtx: { update },
            selectedIds, onClick, showFavorite
        } = this.props;

        return (
            <div {...{ style: { ...style }, key }}>
                {isVisible ? <ProductListPreview
                    warehouseCtx={warehouseCtx}
                    product={p}
                    settingsCtx={settingsCtx}
                    onClick={() => {
                        Products.Get(p.Id).then(product => onClick(product));
                    }}
                    onSelect={onSelect ? () => {
                        Products.Get(p.Id).then(product => onSelect(product));
                    } : undefined}
                    onFavorite={showFavorite ? () => {
                        Products.Patch(p.Id, { Favorite: !p.Favorite }).then(() => {
                            update();
                        });
                    } : undefined}
                    selected={selectedIds && selectedIds.indexOf(p.UID) >= 0}
                /> : null}
            </div>
        );
    }

    private _setCategory(category: Category) {
        this.setState(() => ({ category }));
    }

}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        containerCls: {
            height: '100%',
            position: 'relative',
            flexWrap: 'nowrap'
        },
        menu: {
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
        },
        menuItem: {
            borderLeftWidth: theme.ActiveMenuBorderWidth,
            borderLeftColor: 'transparent',
            borderLeftStyle: 'solid',
            opacity: 0.5,
            flex: '0 0 auto',
            transition: theme.transitions.create('opacity', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.short,
            }),
        },
        menuItemLast: {
            marginTop: 'auto'
        },
        menuItemActive: {
            borderLeftColor: theme.palette.primary.main,
            opacity: 1
        },
        productsContainer: {
            height: '100%',
            position: 'relative',
            flex: '1 1 auto'
        },
        menuContainer: {
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100%',
            position: 'relative',
            flex: '0 0 auto',
            overflow: 'auto'
        },
        productsInner: {
            height: '100%',
            paddingRight: 50,
            paddingLeft: 50
        },
        categoryCount: {
            background: '#cccccc',
            borderRadius: '16px',
            color: '#ffffff',
            display: 'inline-block',
            padding: '4px 8px'
        },
        categoryCountActive: {
            background: theme.palette.primary.main
        }
    };
})(withTheme()(ProductList));