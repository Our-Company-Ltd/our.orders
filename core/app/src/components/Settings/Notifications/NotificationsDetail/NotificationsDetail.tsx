
import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import { DialogContent, DialogActions, Button } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { PaymentNotificationTemplate } from 'src/@types/our-orders/PaymentNotificationTemplate';
import NotificationsFields from '../NotificationsFields/NotificationsFields';
import { InjectedPaymentNotificationTemplateProps } from 'src/_context/PaymentNotification';
import NotificationsMessages from './NotificationsMessages';

export type NotificationsDetailProps = InjectedPaymentNotificationTemplateProps & InjectedIntlProps & {
    initial: PaymentNotificationTemplate;
    changed: (category: PaymentNotificationTemplate) => void;
    onDelete: () => void;
    cancel: () => void;
    changes?: Partial<PaymentNotificationTemplate>;
};

type State = {
    changes: Partial<PaymentNotificationTemplate>;
};

class NotificationsDetail extends React.Component<NotificationsDetailProps, State> {
    constructor(props: NotificationsDetailProps) {
        super(props);

        this.state = {
            changes: {}
        };
    }
    render() {
        return this._renderCategories();
    }

    private _renderCategories() {
        const { cancel, initial: { Id }, intl, initial } = this.props;
        const { changes } = this.state;

        return (
            <React.Fragment>
                <DialogContent>
                    <form
                        onSubmit={(e) => { e.preventDefault(); this._OnSave(changes); }}
                    >
                        <NotificationsFields
                            intl={intl}
                            initial={initial}
                            onChange={(notification: PaymentNotificationTemplate) => {
                                this.setState(prev => {
                                    return ({ changes: { ...prev.changes, ...notification } });
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
                            delete</Button>}
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
        const { paymentNotificationsCtx: notifications, onDelete, intl: { formatMessage } } = this.props;

        const isTodelete = window.confirm(formatMessage(NotificationsMessages.deleteConfirm));

        if (isTodelete) {
            notifications
                .delete(id)
                .then(onDelete);
        }
    }
    private _OnSave(modif: Partial<PaymentNotificationTemplate>) {
        const {
            props: { initial: { Id }, paymentNotificationsCtx: notifications, changed },
            state: { changes }
        } = this;
        const allChanges = { ...changes, ...modif };

        if (Id) {
            return notifications
                .patch(Id, allChanges)
                .then(model => {
                    this.setState(() => ({
                        initial: model,
                        changes: {}
                    }));
                    changed(model);
                });
        } else {
            return notifications
                .create(allChanges)
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

export default NotificationsDetail;