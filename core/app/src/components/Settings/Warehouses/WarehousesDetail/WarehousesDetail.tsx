
import * as React from 'react';

import { InjectedIntlProps, injectIntl } from 'react-intl';
import WarehousesFields from '../WarehousesFields/WarehousesFields';
import { Warehouse } from 'src/@types/our-orders';
import { DialogContent, DialogActions, Button } from '@material-ui/core';
import { InjectedWarehouseProps, InjectedAuthProps } from 'src/_context';
import { Delete } from '@material-ui/icons';
import WarehouseDetailMessages from './WarehousesDetailMessages';
import { IsAdminOrInRole } from 'src/_helpers/roles';

type Props = & InjectedIntlProps &
    InjectedWarehouseProps & InjectedAuthProps & {
        initial: Warehouse;
        changed: (shop: Warehouse) => void;
        onDelete: () => void;
        cancel: () => void;
        changes?: Partial<Warehouse>;
    };

type State = {
    changes: Partial<Warehouse>;
};

class WarehousesDetail extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            changes: {}
        };
    }
    render() {
        return this._renderWarehouse();
    }

    private _renderWarehouse() {

        const { cancel, initial: { Id }, intl, initial, authCtx: { user } } = this.props;
        const { changes } = this.state;

        const hasRights = IsAdminOrInRole(user, 'CRUD_Products');

        return (
            <React.Fragment>
                <DialogContent>
                    <form
                        onSubmit={(e) => { e.preventDefault(); this._OnSave(changes); }}
                    >
                        <WarehousesFields
                            intl={intl}
                            initial={initial}
                            onChange={(warehouse) => {
                                this.setState(prev => {
                                    return ({ changes: { ...prev.changes, ...warehouse } });
                                });
                            }}
                            changes={changes}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    {hasRights && Id &&
                        <Button color="secondary" variant="contained" onClick={() => this._OnDelete(Id)}>
                            <Delete />
                            delete
                        </Button>}
                    <Button color="default" variant="contained" onClick={cancel}>close</Button>
                    {hasRights && (Object.keys(changes).length || !Id) &&
                        <Button color="primary" variant="contained" onClick={() => { this._OnSave(changes); }}>
                            save
                        </Button>
                    }
                </DialogActions>
            </React.Fragment>);
    }

    private _OnDelete(id: string) {
        const { warehouseCtx: Warehouses, onDelete, intl: { formatMessage } } = this.props;
        const isTodelete = window.confirm(formatMessage(WarehouseDetailMessages.deleteConfirm));

        if (isTodelete) {
            Warehouses
                .delete(id)
                .then(onDelete);
        }
    }

    private _OnSave(modif: Partial<Warehouse>) {

        const {
            props: { initial: { Id }, warehouseCtx: Warehouses, changed },
            state: { changes }
        } = this;
        const allChanges = { ...changes, ...modif };

        if (Id) {
            return Warehouses
                .patch(Id, allChanges)
                .then(model => {
                    this.setState(() => ({
                        initial: model,
                        changes: {}
                    }));
                    changed(model);
                });
        } else {
            return Warehouses
                .create(changes)
                .then(model => {
                    this.setState(() => ({
                        initial: model,
                        changes: {}
                    }));
                    changed(model);
                });
        }
    }
}

export const WarehousesDetailStandalone = injectIntl(WarehousesDetail);
export default WarehousesDetail;