import { InjectedIntlProps, FormattedMessage, FormattedNumber, defineMessages } from 'react-intl';
import * as React from 'react';

import { InjectedSettingsProps, InjectedWarehouseProps, InjectedAuthProps } from '../../../_context';
import { Products, ServerStorage } from '../../../_services';
import ItemPreview, { Thumb, Lines, Line } from '../../ItemPreview/ItemPreview';

import { SortEnd, arrayMove } from 'react-sortable-hoc';

import Stock from 'src/components/Stock/Stock';
import { Button, Grid, Dialog, DialogActions, DialogContent, Slide, IconButton } from '@material-ui/core';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import ProductList from '../ProductList/ProductList';
import { Add, Delete, Close, Check } from '@material-ui/icons';
import { Product, Roles } from 'src/@types/our-orders';
import WarehouseIcon from './WarehouseIcon';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, withStyles, WithStyles } from '@material-ui/core/styles';
import Fabs from 'src/components/Fabs/Fabs';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import { SlideProps } from '@material-ui/core/Slide';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import SideDialog from 'src/components/SideDialog/SideDialog';
import DetailGridContainer from 'src/components/DetailGridContainer/DetailGridContainer';
import DetailGridColumn from 'src/components/DetailGridColumn/DetailGridColumn';
import * as classNames from 'classnames';
import ProductDetailMessages from './ProductDetailMessages';
import { SortableListItemsContainer, SortableListItem } from 'src/_helpers/SortableListItem/SortableListItem';
import ProductFields from '../ProductFields/ProductFields';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export const ProductsViewMessages = defineMessages({
    subItems: {
        id: 'ProductDetail.subItems',
        defaultMessage: 'Sub items',
        description: 'Title for product collumn - Sub items'
    },
    addSubItems: {
        id: 'ProductDetail.addSubItem',
        defaultMessage: 'add sub item',
        description: 'Title for product collumn - add Sub item'
    },
    removeSubItems: {
        id: 'ProductDetail.removeSubItem',
        defaultMessage: 'remove',
        description: 'remove Sub item btn'
    },
    closeSubItem: {
        id: 'ProductDetail.closeSubItem',
        defaultMessage: 'close',
        description: 'close Sub item btn'
    }
});

export type injectedClasses =
    'warehouseCls' |
    'SubProductDialogCls' |
    'SubProductDialogScrollPaperCls' |
    'svgIcon' |
    'svgIconRemove' |
    'sortableItem';

export const OrderProducDetailStyles = (theme: OurTheme): StyleRules<injectedClasses> => ({
    warehouseCls: {
        '& path':
            { fill: theme.Colors.gray.primary.main }
    },
    SubProductDialogCls: {
        width: '50%',
        left: 'auto'
    },
    SubProductDialogScrollPaperCls: {
        justifyContent: 'flex-end'
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
    sortableItem: {
        zIndex: 99999
    },
});

export type ProductDetailProps = {
    initial: Product;
    changes?: Partial<Product>;
    cancel: () => void;
    changed: (product: Product) => void;
    onDelete: () => void;
} &
    InjectedCategoryProps &
    InjectedIntlProps &
    InjectedProductProps &
    InjectedSettingsProps &
    InjectedWarehouseProps &
    InjectedAuthProps &
    WithStyles<injectedClasses>;

interface State {
    loading?: boolean;
    initial: Product;
    changes: Partial<Product>;
    openDialog?: boolean;
    openSubProductSelector?: boolean;
    openSubProduct: { [id: string]: boolean };
}

const Transition: (direction: 'left' | 'right' | 'up' | 'down') =>
    React.FunctionComponent<SlideProps> = (direction) => (props) => {
        return <Slide direction={direction} {...props} />;
    };

const TransitionUp = Transition('up');

class ProductDetail extends React.Component<ProductDetailProps, State> {
    static getDerivedStateFromProps(props: ProductDetailProps, state: State) {

        if (props.initial.Id !== state.initial.Id) {
            return {
                changes: props.changes || {},
                initial: props.initial
            };
        }
        return null;
    }
    constructor(props: ProductDetailProps) {
        super(props);
        this._handleMoveItem = this._handleMoveItem.bind(this);
        this._OnSave = this._OnSave.bind(this);
        this._OnDelete = this._OnDelete.bind(this);
        this._addFromProduct = this._addFromProduct.bind(this);
        this._addEmpty = this._addEmpty.bind(this);

        this._handelOpen = this._handelOpen.bind(this);
        this._handelClose = this._handelClose.bind(this);
        const { changes, initial } = this.props;

        this.state = {
            changes: changes || {},
            initial,
            openSubProduct: {}
        };
    }

    render(): JSX.Element {
        const { initial, changes, openDialog, openSubProductSelector, openSubProduct } = this.state;
        const {
            settingsCtx, warehouseCtx, cancel,
            intl, categoryCtx, productCtx, classes,
            authCtx, authCtx: { user }
        } = this.props;

        const preview = { ...initial, ...changes } as Product;

        const changed = !!Object.keys(this.state.changes).length;

        const hasID = !!preview.Id;

        const subProducts = preview.Products || [];

        const skus: { sku: string; legend: string }[] = [];

        const hasRights = IsAdminOrInRole(user, Roles.CRUD_Products);

        const addSKU = (p: Product) => {
            const { SKU, Options } = p;
            if (SKU) {
                skus.push({ sku: SKU, legend: p.Title });
            }
            if (Options && Options.length) {
                const optionsSKU = Options
                    .filter(o => o.SKU).map(o => ({ sku: o.SKU, legend: `${p.Title} ${o.Title}` }));
                skus.push(...optionsSKU);
            }
        };

        addSKU(preview);
        subProducts.forEach(addSKU);

        return (
            <DetailGridContainer>
                <DetailGridColumn>
                    <ProductFields
                        {...{ settingsCtx, intl, initial, changes, categoryCtx, authCtx }}
                        onChange={(product) => {
                            this.setState(prev => {
                                return ({ changes: { ...prev.changes, ...product } });
                            });
                        }}
                    />
                </DetailGridColumn>
                <DetailGridColumn>
                    <SortableListItemsContainer
                        onSortEnd={this._handleMoveItem}
                        pressDelay={200}
                        helperClass={classes.sortableItem}
                    >
                        {subProducts.map((sp, i) => {
                            const subProductSku = sp.SKU || '';
                            const spBasePrice = sp.BasePrice || [];
                            const { Settings } = this.props.settingsCtx;

                            const defaultCurrency = Settings.Currencies.find(() => true) || 'EUR';
                            const price =
                                spBasePrice.find(p => p.Currency === defaultCurrency) ||
                                spBasePrice.find(() => true);
                            const open = () =>
                                this.setState(() => ({ openSubProduct: { ...openSubProduct, [sp.Id]: true } }));
                            const close = () =>
                                this.setState(() => ({ openSubProduct: { ...openSubProduct, [sp.Id]: false } }));

                            const actionDelete = (
                                <IconButton
                                    className="order-items-fields__delete"
                                    onClick={() => this._handleRemoveItem(sp.Id)}
                                >
                                    <Close className={classNames(classes.svgIcon, classes.svgIconRemove)} />
                                </IconButton>);

                            return (
                                <SortableListItem
                                    key={`${i}`}
                                    index={i}

                                >
                                    <Grid
                                        item={true}
                                        xs={12}
                                        key={`${sp.Title}-${i}`}
                                    >
                                        <ItemPreview>
                                            {
                                                sp.Src &&
                                                <Thumb
                                                    src={sp.Src}
                                                    onClick={open}
                                                />
                                            }
                                            <Lines onClick={open}>
                                                <Line isTitle={true}>
                                                    {sp.Title}
                                                </Line>
                                                {subProductSku && <Line>
                                                    {subProductSku}
                                                </Line>}
                                            </Lines>
                                            <Lines actions={true}>
                                                <Line isTitle={true}>
                                                    {price &&
                                                        <span className="products__preview-price">
                                                            <FormattedNumber
                                                                style="currency"
                                                                currency={price.Currency}
                                                                value={price.Value}
                                                            />
                                                        </span>}
                                                </Line>
                                                <Line>
                                                    {hasRights && actionDelete}
                                                </Line>
                                            </Lines>
                                        </ItemPreview>
                                    </Grid>
                                    <SideDialog
                                        onClose={close}
                                        key={sp.Id}
                                        open={!!openSubProduct[sp.Id]}
                                    >
                                        <DialogContent>
                                            <ProductFields
                                                {...{ settingsCtx, intl, categoryCtx, authCtx }}
                                                subProduct={true}
                                                initial={sp}
                                                changes={sp}
                                                onChange={(p) => {
                                                    this._handleItemChange(sp.Id, p);
                                                }}
                                                key={sp.Id}
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            {hasRights && <Button
                                                size="small"
                                                color="secondary"
                                                variant="contained"
                                                onClick={() => this._handleRemoveItem(sp.Id)}
                                            >
                                                <FormattedMessage {...ProductsViewMessages.removeSubItems} />
                                                <Delete />
                                            </Button>}
                                            <Button
                                                size="small"
                                                color="default"
                                                variant="contained"
                                                onClick={close}
                                            >
                                                <FormattedMessage {...ProductsViewMessages.closeSubItem} />
                                            </Button>
                                        </DialogActions>
                                    </SideDialog>
                                </SortableListItem>

                            );
                        })}
                        {hasRights &&
                            <React.Fragment>
                                <Grid
                                    item={true}
                                    xs={12}
                                >
                                    <GridContainer justify="center" spacing={8}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => this.setState(() => ({ openSubProductSelector: true }))}
                                        >
                                            <FormattedMessage {...ProductsViewMessages.addSubItems} />
                                            <PlaylistAddIcon style={{ paddingLeft: '7px' }} />
                                        </Button>
                                    </GridContainer>
                                </Grid>
                                <Dialog
                                    fullScreen={true}
                                    TransitionComponent={TransitionUp}
                                    open={!!openSubProductSelector}
                                >
                                    <ProductList
                                        productCtx={productCtx}
                                        warehouseCtx={warehouseCtx}
                                        intl={intl}
                                        settingsCtx={settingsCtx}
                                        categoryCtx={categoryCtx}
                                        onClick={this._addFromProduct}
                                    />
                                    <Fabs
                                        map={[
                                            {
                                                icon: <Add />,
                                                onClick: this._addEmpty
                                            },
                                            {
                                                icon: <Close />,
                                                onClick: () => this.setState(() => ({ openSubProductSelector: false }))
                                            }
                                        ]}
                                    />
                                </Dialog>
                            </React.Fragment>
                        }
                    </SortableListItemsContainer>

                </DetailGridColumn>

                {skus.length > 0 &&
                    <Dialog
                        maxWidth="lg"
                        open={!!openDialog}
                        onClose={this._handelClose}
                    >
                        <DialogContent>
                            <Stock
                                {...{ settingsCtx, warehouseCtx, authCtx }}
                                skus={skus}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="contained"
                                color="default"
                                onClick={this._handelClose}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                }
                <Fabs
                    map={[
                        hasRights && changed &&
                        {
                            icon: <Check />,
                            legend: 'save',
                            themeColor: 'green',
                            onClick: this._OnSave
                        },
                        skus.length > 0 && {
                            icon: <WarehouseIcon />,
                            legend: 'stocks',
                            themeColor: 'gray',
                            onClick: this._handelOpen
                        },
                        {
                            icon: <Close />,
                            legend: changed ? 'cancel' : 'close',
                            themeColor: 'gray',
                            onClick: cancel
                        },
                        hasRights && hasID && {
                            icon: <Delete />,
                            legend: 'delete product',
                            themeColor: 'red',
                            onClick: this._OnDelete
                        }
                    ]}
                />
            </DetailGridContainer>
        );
    }

    private _handleMoveItem(sortEnd: SortEnd) {
        const preview = { ...this.state.initial, ...this.state.changes } as Product;
        const subProducts = preview.Products || [];

        const newSubProducts = arrayMove(subProducts, sortEnd.oldIndex, sortEnd.newIndex);
        this._OnChange({ Products: newSubProducts });
    }
    private _addFromProduct(product: Product) {
        const { initial, changes } = this.state;
        const preview = { ...initial, ...changes } as Product;

        this._OnChange({
            Products: [...(preview.Products || []),
            // tslint:disable-next-line:no-any
            { ...product, Products: undefined, Id: undefined as any }]
        });
        this.setState(() => ({ openSubProductSelector: false }));
    }
    private _addEmpty() {
        const { initial, changes } = this.state;
        const preview = { ...initial, ...changes } as Product;

        const subProducts = preview.Products || [];
        // const newUID = shortid();
        // todo: localization
        Products.Empty('new product', {}).then(newProduct => {
            const newItems = [...subProducts, newProduct];
            this._OnChange({ Products: newItems });
            this.setState(() => ({ openSubProductSelector: false }));
        });
    }

    private _handleRemoveItem(id: string) {
        const preview = { ...this.state.initial, ...this.state.changes } as Product;

        const subProducts = preview.Products || [];
        const newItems = [...subProducts];
        const index = newItems.findIndex(i => i.Id === id);

        if (index < 0) {
            return;
        } else {
            newItems.splice(index, 1);
        }

        this._OnChange({ Products: newItems });
    }

    private _handleItemChange(id: string, value: Partial<Product>) {
        const preview = { ...this.state.initial, ...this.state.changes } as Product;

        const subProducts = preview.Products || [];

        const newItems = [...subProducts];
        const index = newItems.findIndex(i => i.Id === id);

        if (index < 0) {
            newItems.push(value as Product);
        } else {
            newItems[index] = { ...newItems[index], ...value };
        }

        this._OnChange({ Products: newItems });
    }

    private _OnChange(changes: Partial<Product>) {
        this.setState(prev => {
            return ({ changes: { ...prev.changes, ...changes } });
        });
    }

    private _OnDelete() {

        const { initial: { Id }, intl: { formatMessage } } = this.props;
        const isTodelete = window.confirm(formatMessage(ProductDetailMessages.deleteConfirm));

        if (isTodelete) {
            Products
                .Delete(Id)
                .then(() => {
                    this.props.onDelete();
                });
        }
    }

    private _handelOpen() {
        this.setState({ openDialog: true });
    }

    private _handelClose() {
        this.setState({ openDialog: false });
    }

    private _UploadBlobs(product: Partial<Product>): Promise<Partial<Product>> {

        const products = product.Products || [] as Partial<Product>[];
        const blob = product.Blob;
        return Promise
            .all((products || []).map(p => this._UploadBlobs(p)))
            .then(v => {
                if (!blob) {
                    return Promise.resolve({ ...product, Products: v as Product[] });
                }
                var data = new FormData();
                data.set('image', blob);
                return ServerStorage.Post(data).then(result => {
                    product.Src = `${result.image}`;
                    delete product.Blob;
                    return product;
                });
            });
    }

    private _OnSave() {
        const save = (saveChanges: Partial<Product>) => {
            if (this.state.initial.Id) {
                return Products
                    .Patch(this.props.initial.Id, this.state.changes)
                    .then(model => {
                        this.setState(prev => ({
                            ...prev,
                            changes: {},
                            preview: model,
                            initial: model
                        }));
                        this.props.changed(model);
                    });
            } else {
                return Products
                    .Create(saveChanges)
                    .then(model => {
                        this.setState(prev => ({
                            ...prev,
                            changes: {},
                            preview: model,
                            initial: model
                        }));
                        this.props.changed(model);
                    });
            }
        };

        this._UploadBlobs(this.state.changes)
            .then(save);
    }
}

export default withStyles(OrderProducDetailStyles)(ProductDetail);