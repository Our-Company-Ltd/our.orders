import * as React from 'react';
import { withList, ListContext } from '../../ModelBaseList/ModelBaseList';
import { Products } from '../../../_services';
import ProductDetail from '../ProductDetail/ProductDetail';

import { InjectedIntlProps } from 'react-intl';

import { InjectedSettingsProps } from '../../../_context/Settings';

import { InjectedWarehouseProps, InjectedAuthProps } from '../../../_context';
import ProductList from '../ProductList/ProductList';
import { Product, Roles } from 'src/@types/our-orders';
import { InjectedCategoryProps } from 'src/_context/Category';
import { Dialog } from '@material-ui/core';
import { InjectedProductProps } from 'src/_context/Product';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import { Cached, Add } from '@material-ui/icons';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export type ProductPageProps =
    InjectedCategoryProps &
    InjectedIntlProps &
    InjectedSettingsProps &
    InjectedProductProps &
    InjectedWarehouseProps &
    InjectedAuthProps &
    {
        list: ListContext<Product>;
    };
type State = {
    editing?: Product;
    editingOpened?: boolean;
    creating?: Product;
    creatingOpened?: boolean;
};

export class ProductPage extends React.Component<ProductPageProps, State> {

    constructor(props: ProductPageProps) {
        super(props);
        this.state = {};
    }
    render() {
        const {
            list, settingsCtx, warehouseCtx,
            intl, categoryCtx, productCtx,
            productCtx: { fetching }, 
            authCtx, authCtx: { user }
        } = this.props;
        const {
            editing,
            editingOpened,
            creating,
            creatingOpened
        } = this.state;

        const loadingBtn: FabBtnProps = {
            icon: <Cached />,
            legend: 'loading',
            themeColor: 'gray'
        };

        const add = () => {
            Products.Empty('New Product', {}).then(newCreated => {
                this.setState(() => ({
                    creating: newCreated, creatingOpened: true
                }));
            });
        };

        const addBtn: FabBtnProps = {
            icon: <Add />,
            legend: 'add new product',
            themeColor: 'green',
            onClick: add
        };
        const closeCreating = () => {
            this.setState(() => ({ creatingOpened: false }));
        };
        const closeEditing = () => {
            this.setState(() => ({ editingOpened: false }));
        };

        const hasRights = IsAdminOrInRole(user, Roles.CRUD_Products);

        return (
            <div style={{ position: 'relative', height: '100%' }}>
                <ProductList
                    {...{ categoryCtx, list, settingsCtx, warehouseCtx, productCtx, intl }}
                    onClick={(p) => {
                        this.setState(() => ({ editing: p, editingOpened: true }));
                    }}
                    showFavorite={true}
                />
                <Fabs
                    map={[
                        hasRights && !fetching && addBtn,
                        fetching && loadingBtn
                    ]}
                />

                {editing &&
                    <Dialog
                        open={!!editingOpened}
                        fullScreen={true}
                        onClose={closeEditing}
                    >

                        <ProductDetail
                            {...{ intl, warehouseCtx, settingsCtx, categoryCtx, productCtx, authCtx }}
                            key={editing.Id}
                            warehouseCtx={warehouseCtx}
                            cancel={closeEditing}
                            changed={(p) => {
                                this._editingChanged(p);
                            }}
                            onDelete={() => {
                                this._editingDeleted(editing.Id);
                            }}
                            initial={editing}
                        />

                    </Dialog>
                }
                {creating &&
                    <Dialog
                        open={!!creatingOpened}
                        fullScreen={true}
                        onClose={closeCreating}
                    >

                        <ProductDetail
                            {...{ intl, warehouseCtx, settingsCtx, categoryCtx, productCtx, authCtx }}
                            warehouseCtx={warehouseCtx}
                            cancel={closeCreating}
                            changed={(p) => {
                                this._creatingChanged();
                            }}
                            onDelete={() => {
                                this._creatingChanged();
                            }}
                            initial={creating}
                        />

                    </Dialog>
                }
            </div>);
    }
    private _editingChanged(product: Product) {
        this.props.productCtx.update();
        this.setState((prev) => ({
            editing: undefined
        }));
    }
    private _editingDeleted(id: string) {
        this.props.productCtx.update();
        this.setState((prev) => ({
            editing: undefined
        }));
    }

    private _creatingChanged() {
        this.setState(() => ({ creating: undefined }), () => {
            return this.props.productCtx.update();
        });
    }
}

// tslint:disable-next-line:max-line-length
export default withList(ProductPage, Products);