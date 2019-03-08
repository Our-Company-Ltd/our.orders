import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';

import {
    Close, Check, Delete
} from '@material-ui/icons';
import { Voucher, Order, Movement } from 'src/@types/our-orders';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import MovementsFields from '../MovementsFields/MovementsFields';
import { Orders, Movements } from 'src/_services';

import {
    InjectedSettingsProps, InjectedWarehouseProps, InjectedAuthProps, InjectedShopProps, InjectedUsersProps
} from 'src/_context';

import DetailGridContainer from 'src/components/DetailGridContainer/DetailGridContainer';
import DetailGridColumn from 'src/components/DetailGridColumn/DetailGridColumn';
import OrderListItem from 'src/components/Orders/OrderListItem/OrderListItem';
import { Dialog, DialogContent } from '@material-ui/core';
import OrderDetail from 'src/components/Orders/OrderDetail/OrderDetail';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import { Filter } from 'src/_helpers/Filter';
import MovementsMessages from './MovementsMessages';

export type MovementsDetailProps =
    InjectedWarehouseProps &
    InjectedCategoryProps &
    InjectedAuthProps &
    InjectedShopProps &
    InjectedUsersProps &
    InjectedProductProps &
    InjectedTemplatesProps &
    InjectedSettingsProps &
    InjectedIntlProps &
    {
        id?: string;
        preview: Movement;
        onCancel: () => void;
        onChanged?: (changed: Movement) => void;
        onDelete: () => void;
        // uid: string;
    };

type State = {
    id?: string;
    current: Movement;
    changes: Partial<Voucher>;
    loading?: boolean;
    orders: Order[]

    orderOpened?: string;
};

class MovementsDetail extends React.Component<MovementsDetailProps, State> {
    constructor(props: MovementsDetailProps) {
        super(props);

        this._Save = this._Save.bind(this);
        this._Delete = this._Delete.bind(this);
        this._OnChanged = this._OnChanged.bind(this);

        const { id, preview } = props;

        this.state = {
            id,
            changes: id ? {} : preview,
            current: preview,
            orders: []
        };
    }
    render() {
        const {
            intl,
            warehouseCtx, authCtx, settingsCtx,
            shopCtx, usersCtx,
            templateCtx,
            categoryCtx, productCtx
        } = this.props;

        const { current, loading, orders, orderOpened } = this.state;

        return (
            <DetailGridContainer>
                <DetailGridColumn>
                    <MovementsFields
                        {...{
                            intl,
                            current,
                            usersCtx,
                            shopCtx,
                            warehouseCtx,
                            templateCtx,
                            authCtx,
                            settingsCtx,
                            categoryCtx,
                            productCtx,
                            onChange: this._OnChanged
                        }}
                    />
                </DetailGridColumn>
                <DetailGridColumn>
                    {!loading && orders &&
                        orders.map(o => {
                            const { Id } = o;
                            const open = () => this.setState(() => ({ orderOpened: Id }));
                            const close = (callback?: () => void) =>
                                this.setState(() => ({ orderOpened: undefined }), callback);
                            return (
                                <div key={Id}>
                                    <OrderListItem
                                        intl={intl}
                                        onClick={open}
                                        order={o}
                                    />
                                    <Dialog open={orderOpened === o.Id}>
                                        <DialogContent>
                                            <OrderDetail
                                                {...{
                                                    intl,
                                                    shopCtx,
                                                    usersCtx,
                                                    warehouseCtx,
                                                    templateCtx,
                                                    authCtx,
                                                    settingsCtx,
                                                    categoryCtx,
                                                    productCtx
                                                }}
                                                preventEditClient={true}
                                                preview={o}
                                                id={o.Id}
                                                onCancel={close}
                                                onChanged={() => {
                                                    this._loadOrders();
                                                }}
                                                onDelete={() => {
                                                    close(() => this._loadOrders());
                                                }}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            );
                        })
                    }
                </DetailGridColumn>
                {this._renderActions()}
            </DetailGridContainer>
        );
    }

    private _renderActions() {

        const { loading, changes, id } = this.state;
        const changed = !!Object.keys(changes).length;

        const saveBtn: FabBtnProps = {
            icon: <Check />,
            onClick: () => this._Save(),
            themeColor: 'green',
            legend: 'save'
        };

        const deleteBtn: FabBtnProps = {

            icon: <Delete />,
            legend: 'delete',
            themeColor: 'red',
            onClick: this._Delete
        };

        const cancelBtn: FabBtnProps = {
            icon: <Close />,
            onClick: () => this.props.onCancel(),
            themeColor: 'gray',
            legend: changed ? 'cancel' : 'close'
        };

        if (loading) {
            return (
                <Fabs
                    map={['loading']}
                />);
        }

        return (
            <Fabs
                map={[
                    changed && saveBtn,
                    cancelBtn,
                    !!id && deleteBtn,
                ]}
            />);
    }

    private _OnChanged(changes: Partial<Voucher>) {
        const { current: old } = this.state;
        const current = { ...old, ...changes };
        this.setState((prev) => ({ current, changes: { ...prev.changes, ...changes } }));
    }

    private _loadOrders() {
        const { id } = this.state;
        if (!id) { return; }
        this.setState(
            () => ({ loading: true }),
            () => {
                const filter = Filter.Eq('ClientId', id);
                const def = { filters: [filter] };

                Orders.Find(def, 0, 100).then(orders => {
                    this.setState(() => ({ orders: orders.Values, loading: false }));
                });
            }
        );
    }

    private _Save() {
        const { changes, current, id } = this.state;

        const final = { ...current, ...changes };

        if (id) {
            return Movements
                .Patch(id, final)
                .then(model => {
                    this.setState(() => ({
                        changes: {},
                        current: model
                    }));
                    if (this.props.onChanged) {
                        this.props.onChanged(model);
                    }
                });
        } else {
            return Movements
                .Create(final)
                .then(model => {
                    this.setState(() => ({
                        changes: {},
                        current: model,
                        id: model.Id
                    }));
                    if (this.props.onChanged) {
                        this.props.onChanged(model);
                    }
                });
        }
    }

    private _Delete() {
        const { id } = this.state;
        const { onDelete, intl: {formatMessage} } = this.props;

        const isToDelete = window.confirm(formatMessage(MovementsMessages.deleteConfirm));
        if (id && isToDelete) {
            Movements
                .Delete(id)
                .then(onDelete);
        }
    }
}
export default MovementsDetail;