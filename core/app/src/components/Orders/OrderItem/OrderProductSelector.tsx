import * as React from 'react';

import {
    InjectedIntlProps
} from 'react-intl';

import { InjectedSettingsProps, InjectedWarehouseProps } from '../../../_context';
import ProductList from '../../Products/ProductList/ProductList';

import { OrderProductSelectionEditor } from './OrderProductSelectionEditor';
import { Product, ProductSelection } from 'src/@types/our-orders';
import { Dialog, DialogTitle, DialogContent, Button, DialogActions } from '@material-ui/core';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import { Add, Cached, LibraryAdd } from '@material-ui/icons';

const toSelection = (p: Product): ProductSelection => {
    return {
        ProductId: p.UID,
        Products: p.Products ? p.Products.map(toSelection) : [],
        Quantity: p.MinQuantity || 1,
    };
};
export type OrderProductSelectorProps =
    InjectedCategoryProps &
    InjectedIntlProps &
    InjectedProductProps &
    InjectedSettingsProps &
    InjectedWarehouseProps &
    {
        currency: string;
        onClose: () => void;
        onConfirm: (selections: ProductSelection[]) => void;
        onSelectEmpty?: () => void;
        open: boolean;
    };

type State = {
    selections: ProductSelection[];
    products: Product[];
    orderProductDialogOpen: boolean;
};

export class OrderProductSelector extends React.Component<OrderProductSelectorProps, State> {
    constructor(props: OrderProductSelectorProps) {
        super(props);
        this.state = {
            orderProductDialogOpen: false,
            selections: [],
            products: []
        };
    }

    render(): React.ReactElement<HTMLDivElement> {
        const {
            settingsCtx,
            warehouseCtx,
            intl,
            onSelectEmpty,
            categoryCtx,
            productCtx,
            productCtx: { fetching },
            open,
            currency,
            onClose
        } = this.props;
        const { orderProductDialogOpen, selections, products } = this.state;
        const confirmSelectBtn: FabBtnProps = {
            icon: <LibraryAdd />,
            legend: 'confirm select',
            themeColor: 'green',
            onClick: () => {
                this.setState(() => ({
                    orderProductDialogOpen: true
                }));
            }
        };
        const selectEmptyBtn: FabBtnProps = {
            icon: <Add />,
            legend: 'emptyproduct',
            themeColor: 'green',
            onClick: onSelectEmpty ? () => {
                onSelectEmpty();
                onClose();
            } : undefined
        };

        const loadingBtn: FabBtnProps = {
            icon: <Cached />,
            legend: 'loading',
            themeColor: 'gray'
        };

        return (
            <React.Fragment>
                <Dialog
                    open={open}
                    fullScreen={true}
                    onClose={onClose}
                >
                    <ProductList
                        productCtx={productCtx}
                        categoryCtx={categoryCtx}
                        warehouseCtx={warehouseCtx}
                        intl={intl}
                        settingsCtx={settingsCtx}
                        selectedIds={products.map(p => p.UID)}
                        showFavorite={false}
                        onClick={(p) => {
                            this.setState(() => ({
                                products: [p],
                                selections: [toSelection(p)],
                                orderProductDialogOpen: true
                            }));
                        }}
                        onSelect={(selected) => {
                            const remove = !!products.find(p => p.UID === selected.UID);
                            this.setState((prev) => ({
                                products: remove ?
                                    prev.products.filter(p => p.UID !== selected.UID) :
                                    [...prev.products, selected],
                                selections: remove ?
                                    prev.selections.filter(p => p.ProductId !== selected.UID) :
                                    [...prev.selections, toSelection(selected)]
                            }));
                        }}
                    />
                    <Fabs
                        map={[
                            !fetching && products && products.length > 0 && confirmSelectBtn,
                            !fetching && selectEmptyBtn,
                            fetching && loadingBtn
                        ]}
                    />
                </Dialog>

                {selections && products &&
                    <Dialog
                        open={orderProductDialogOpen}
                        onClose={() => this.setState({ orderProductDialogOpen: false })}
                    >
                        <DialogTitle>Choose quantities</DialogTitle>
                        <DialogContent>
                            {products.map((p, i) => {
                                const changeSelection =
                                    (arr: ProductSelection[], index: number, value: ProductSelection) =>
                                        arr.map((v, ind) => ind === index ? value : v);
                                return (
                                    <div key={`${i}-${p.UID}`}>
                                        <OrderProductSelectionEditor
                                            intl={intl}
                                            currency={currency}
                                            product={p}
                                            selection={selections[i]}
                                            onChange={(sel) =>
                                                this.setState(
                                                    () => ({
                                                        selections: changeSelection(selections, i, sel)
                                                    })
                                                )}
                                        />
                                        {p.Products && p.Products.map((sp, j) =>
                                            <OrderProductSelectionEditor
                                                key={i}
                                                intl={intl}
                                                currency={currency}
                                                product={sp}
                                                selection={selections[i].Products[j]}
                                                onChange={(sel) => this.setState(() => ({
                                                    selections:
                                                        changeSelection(
                                                            selections,
                                                            i,
                                                            {
                                                                ...selections[i],
                                                                Products:
                                                                    changeSelection(selections[i].Products, j, sel)
                                                            }
                                                        )
                                                })
                                                )}
                                            />
                                        )}
                                    </div>);
                            }
                            )}

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({ orderProductDialogOpen: false, selections: [] })}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={() => {
                                    this.props.onConfirm(selections);
                                    this.setState({ orderProductDialogOpen: false, selections: [] });
                                }}
                            >
                                Add
                            </Button>
                        </DialogActions>
                    </Dialog>
                }
            </React.Fragment>);
    }
}

export default OrderProductSelector;