
import * as React from 'react';

import { InjectedIntlProps, injectIntl } from 'react-intl';
import ShopsFields from '../ShopsFields/ShopsFields';
import { Shop } from 'src/@types/our-orders';
import { DialogContent, DialogActions, Button } from '@material-ui/core';
import { InjectedShopProps } from 'src/_context';
import { Delete } from '@material-ui/icons';
import ShopDetailMesseges from './ShopsDetailMessages';

type Props = & InjectedIntlProps & InjectedShopProps & {
    initial: Shop;
    changed: (shop: Shop) => void;
    onDelete: () => void;
    cancel: () => void;
    changes?: Partial<Shop>;
};

type State = {
    changes: Partial<Shop>;
};

class ShopsDetail extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            changes: {}
        };
    }

    render() {
        return this._renderShop();
    }

    private _renderShop() {

        const { cancel, initial: { Id }, intl, initial } = this.props;
        const { changes } = this.state;

        return (
            <React.Fragment>
                <DialogContent>
                    <form
                        onSubmit={(e) => { e.preventDefault(); this._OnSave(this.state.changes); }}
                    >
                        <ShopsFields
                            intl={intl}
                            initial={initial}
                            onChange={(shop) => {
                                this.setState(prev => {
                                    return ({ changes: { ...prev.changes, ...shop } });
                                });
                            }}
                            changes={changes}
                        />
                    </form>
                </DialogContent>

                <DialogActions>
                    {Id &&
                        <Button color="secondary" variant="contained" onClick={() => this._OnDelete(Id)}>
                            <Delete />
                            delete
                    </Button>}
                    <Button color="default" variant="contained" onClick={cancel}>close</Button>
                    {(Object.keys(changes).length || !Id) &&
                        <Button color="primary" variant="contained" onClick={() => { this._OnSave(changes); }}>
                            save
                    </Button>
                    }
                </DialogActions>
            </React.Fragment>);
    }

    private _OnDelete(id: string) {
        const { shopCtx: Shops, onDelete, intl: { formatMessage } } = this.props;

        const isTodelete = window.confirm(formatMessage(ShopDetailMesseges.deleteConfirm));

        if (isTodelete) {
            Shops
                .delete(id)
                .then(onDelete);
        }
    }

    private _OnSave(modif: Partial<Shop>) {
        const {
            props: { initial: { Id }, shopCtx: Shops, changed },
            state: { changes }
        } = this;
        const allChanges = { ...changes, ...modif };

        if (Id) {
            return Shops
                .patch(Id, allChanges)
                .then(model => {
                    this.setState(() => ({
                        initial: model,
                        changes: {},
                    }));
                    changed(model);
                });
        } else {
            return Shops
                .create(allChanges)
                .then(model => {
                    this.setState(() => ({
                        initial: model,
                        changes: {},
                    }));
                    changed(model);
                });
        }
    }
}

export const UsersDetailStandalone = injectIntl(ShopsDetail);
export default ShopsDetail;