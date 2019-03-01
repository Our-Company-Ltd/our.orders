import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';

import {
    Close, Check, Delete
} from '@material-ui/icons';
import { Voucher, Order, Roles } from 'src/@types/our-orders';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import VoucherFields, { VoucherFieldsProps } from '../VoucherFields/VoucherFields';
import { Vouchers, Orders } from 'src/_services';
import {
    InjectedSettingsProps,
    InjectedWarehouseProps,
    InjectedAuthProps,
    InjectedShopProps,
    InjectedUsersProps
} from 'src/_context';
import DetailGridContainer from 'src/components/DetailGridContainer/DetailGridContainer';
import DetailGridColumn from 'src/components/DetailGridColumn/DetailGridColumn';
import OrderListItem from 'src/components/Orders/OrderListItem/OrderListItem';
import { Dialog, DialogContent, Grid, WithStyles, withStyles } from '@material-ui/core';
import OrderDetail from 'src/components/Orders/OrderDetail/OrderDetail';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import { Filter } from 'src/_helpers/Filter';
import VoucherCode, { CODE_LENGTH } from 'src/components/VoucherCode/VoucherCode';
import { FilterDefinition } from 'src/_types/FilterDefinition';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import VoucherDetailMessages from './VoucherDetailMessages';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export type injectedClasses = 'codeWrapper' | 'columnsWrapper';

export type VoucherDetailProps =
    InjectedWarehouseProps &
    InjectedCategoryProps &
    InjectedAuthProps &
    InjectedShopProps &
    InjectedProductProps &
    InjectedUsersProps &
    InjectedTemplatesProps &
    InjectedSettingsProps &
    InjectedIntlProps &
    WithStyles<injectedClasses> &
    {
        id?: string;
        preview: Voucher;
        onCancel: () => void;
        onChanged?: (changed: Voucher) => void;
        onDelete: () => void;
        // uid: string;
    };

type State = {
    id?: string;
    current: Voucher;
    changes: Partial<Voucher>;
    loading?: boolean;
    orders: Order[]

    orderOpened?: string;
};

export class VoucherDetail extends React.Component<VoucherDetailProps, State> {
    constructor(props: VoucherDetailProps) {
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
    componentDidMount() {
        this._loadOrders(); 
    }
    render() {
        const { intl,
            warehouseCtx, authCtx, settingsCtx,
            templateCtx, usersCtx,
            categoryCtx, productCtx, shopCtx, classes
        } = this.props;

        const { current, loading, orders, orderOpened } = this.state;
        const { Code } = current;

        const code = (Code && Code.split('', CODE_LENGTH)) || [];

        const fieldsProps: VoucherFieldsProps = {
            settingsCtx,
            authCtx,
            current,
            intl,
            onChange: this._OnChanged
        };

        return (
            <DetailGridContainer>
                <Grid container={true} spacing={0}>
                    <Grid item={true} xs={12}>
                        <div className={classes.codeWrapper}>
                            <VoucherCode
                                onChange={c => this._OnChanged({ Code: c.join('') })}
                                code={code}
                                authCtx={authCtx}
                            />
                        </div>
                    </Grid>
                    <DetailGridColumn className={classes.columnsWrapper}>
                        <VoucherFields {...fieldsProps} />
                    </DetailGridColumn>
                    <DetailGridColumn className={classes.columnsWrapper}>
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
                                        <Dialog
                                            open={orderOpened === o.Id}
                                            fullScreen={true}
                                        >
                                            <DialogContent>
                                                <OrderDetail
                                                    {...{
                                                        intl,
                                                        shopCtx,
                                                        warehouseCtx,
                                                        templateCtx,
                                                        authCtx,
                                                        usersCtx,
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
                </Grid>
            </DetailGridContainer>
        );
    }

    private _renderActions() {

        const { loading, changes, id } = this.state;
        const changed = !!Object.keys(changes).length;
        const { authCtx: { user } } = this.props;

        const hasRights = IsAdminOrInRole(user, Roles.CRUD_Vouchers);

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
                    hasRights && changed && saveBtn,
                    cancelBtn,
                    hasRights && !!id && deleteBtn,
                ]}
            />);
    }

    private _OnChanged(changes: Partial<Voucher>) {
        const { current: old } = this.state;
        const current = { ...old, ...changes };
        this.setState((prev) => ({ current, changes: { ...prev.changes, ...changes } }));
    }

    private _loadOrders() {
        const { authCtx: { user } } = this.props;
        const canListOrders = IsAdminOrInRole(user, Roles.List_Orders);

        const { id, current: { OrderIds } } = this.state;

        if (!id || !canListOrders || !OrderIds || !OrderIds.length) { return; }
        this.setState(
            () => ({ loading: true }),
            () => {
                const filters = OrderIds.map(Id => Filter.Eq('Id', Id));
                const def = { filters, operator: 'or' } as FilterDefinition;

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
            return Vouchers
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
            return Vouchers
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
        const { onDelete, intl: { formatMessage } } = this.props;

        const isTodelete = window.confirm(formatMessage(VoucherDetailMessages.deleteConfirm));
        if (id && isTodelete) {
            Vouchers
                .Delete(id)
                .then(onDelete);
        }
    }
}

const padding = 20;
export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        codeWrapper: {
            marginTop: padding,
            marginBottom: padding
        },
        columnsWrapper: {
            height: `calc(100% - 200px)`
        }
    };
})(VoucherDetail);