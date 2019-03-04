import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';

import { Clients, Orders, SubscribeNewsletter } from '../../../_services';

import { ClientFields } from '../ClientFields/ClientFields';

import { OrderDetail } from '../../Orders/OrderDetail/OrderDetail';
import OrderListItem from '../../Orders/OrderListItem/OrderListItem';
import { InjectedShopProps } from 'src/_context/Shop';
import { InjectedWarehouseProps, InjectedAuthProps, InjectedSettingsProps, InjectedUsersProps } from 'src/_context';
import { Client, Order } from 'src/@types/our-orders';
import { Filter } from 'src/_helpers/Filter';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import { DialogContent, Dialog } from '@material-ui/core';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import { Close, Delete, Check, Print, ContactMail } from '@material-ui/icons';
import DetailGridContainer from 'src/components/DetailGridContainer/DetailGridContainer';
import DetailGridColumn from 'src/components/DetailGridColumn/DetailGridColumn';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import ClientDocumentsDialog, { PrintClient } from './ClientDocumentsDialog';
import OrderDocumentsDialogMessages from 'src/components/Orders/OrderDetail/OrderDocumentsDialogMessages';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export type ClientProps =
    InjectedWarehouseProps &
    InjectedSettingsProps &
    InjectedCategoryProps &
    InjectedAuthProps &
    InjectedIntlProps &
    InjectedProductProps &
    InjectedTemplatesProps &
    InjectedUsersProps &
    InjectedShopProps & {
        id?: string;
        preview: Client;
        onCancel: () => void;
        onChanged?: (changed: Client) => void;
        onDelete: () => void;
    };

type State = {
    id?: string;
    current: Client;
    loading?: boolean;
    changes: Partial<Client>;
    orders: Order[];

    orderOpened?: string;

    templatesOpened?: boolean;
};

class ClientDetail extends React.Component<ClientProps, State> {

    // static getDerivedStateFromProps(props: ClientProps, state: State) {
    //     const { creating } = props;
    //     const { creating: stateCreating } = state;

    //     if (creating !== stateCreating) {
    //         return ({ creating: props.creating });
    //     }
    //     return null;
    // }

    constructor(props: ClientProps) {
        super(props);
        this._Update = this._Update.bind(this);
        this._Refresh = this._Refresh.bind(this);
        this._Save = this._Save.bind(this);
        this._Delete = this._Delete.bind(this);

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
        const {
            intl, shopCtx,
            warehouseCtx, authCtx, settingsCtx,
            templateCtx, usersCtx,
            categoryCtx, productCtx, authCtx: { user }
        } = this.props;

        const {
            id,
            changes,
            current,
            orderOpened,
            loading,
            orders,
            templatesOpened
        } = this.state;

        const changed = !!Object.keys(changes).length;
        const hasRights = IsAdminOrInRole(user, 'CRUD_Clients');

        const saveBtn: FabBtnProps = {
            icon: <Check />,
            onClick: () => this._Save(),
            themeColor: 'green',
            legend: 'save'
        };

        const cancelBtn: FabBtnProps = {
            icon: <Close />,
            onClick: () => this.props.onCancel(),
            themeColor: 'gray',
            legend: changed ? 'cancel' : 'close'
        };

        const deleteBtn: FabBtnProps = {

            icon: <Delete />,
            legend: 'delete',
            themeColor: 'red',
            onClick: this._Delete
        };

        const newsletters: FabBtnProps[] = hasRights ? settingsCtx.Settings.NewsletterProviders.map(n =>
            ({
                icon: <ContactMail />,
                legend: `add to ${n}`,
                themeColor: 'blue',
                onClick: () => SubscribeNewsletter(current, n)
            } as FabBtnProps)
        ) : [];

        const templates = templateCtx
            .templates
            .filter(t => t.ApplyTo === 'client');

        const templateBtn = templates.length > 0 && {
            icon: <Print />,
            legend: templates.length > 1 ? 'documents' : templates[0].Title,
            themeColor: 'gray',
            onClick: templates.length > 1 ?
                () => this.setState(() => ({ templatesOpened: true })) : () => PrintClient(templates[0].Id, current)
        } as FabBtnProps;

        const btns = [
            hasRights && changed && saveBtn,
            cancelBtn,
            hasRights && templateBtn,
            hasRights && !!id && deleteBtn,
            ...newsletters
        ];

        return (
            <DetailGridContainer>
                <DetailGridColumn>
                    <ClientFields
                        {...{
                            changes: changes,
                            initial: current,
                            onChange: this._Update,
                            intl: intl,
                            authCtx
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
                                    <Dialog
                                        open={orderOpened === o.Id}
                                        fullScreen={true}
                                    >
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
                {templates.length > 1 ?
                    <ClientDocumentsDialog
                        opened={templatesOpened}
                        current={current}
                        intl={intl}
                        templates={templates}
                        onClose={() => this.setState(() => ({ templatesOpened: false }))}
                    /> : null}
                <Fabs
                    map={btns}
                />
            </DetailGridContainer>);
    }

    // private _OnChanged(changes: Partial<Person>) {
    //     this.setState(() => ({ changes: changes }));
    // }
    private _Update(changes: Partial<Client>) {
        const { current: old } = this.state;
        const current = { ...old, ...changes };
        this.setState(
            (prev) => ({ current, loading: true, changes: { ...prev.changes, ...changes } })
        );
    }
    private _Refresh() {
        this._Update({});
    }

    private _Save(extrachanges?: Partial<Client>) {
        const { changes, id } = this.state;

        const finalchanges = { ...changes, ...extrachanges };

        if (id) {
            return Clients
                .Patch(id, finalchanges)
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
            return Clients
                .Create(finalchanges)
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
        const isTodelete = window.confirm(formatMessage(OrderDocumentsDialogMessages.deleteConfirm));

        if (id && isTodelete) {
            Clients
                .Delete(id)
                .then(onDelete);
        }
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
}

export default ClientDetail;