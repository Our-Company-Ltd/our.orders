import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import { PaymentNotifications } from '../../../../_services';
import { WithStyles, withStyles, Grid, Avatar } from '@material-ui/core';
import ItemPreview, { Lines, Line } from 'src/components/ItemPreview/ItemPreview';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { Add, FileCopy } from '@material-ui/icons';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import { InjectedAuthProps } from 'src/_context';
import { IsAdminOrInRole } from 'src/_helpers/roles';
import { PaymentNotificationTemplate } from 'src/@types/our-orders/PaymentNotificationTemplate';
import { InjectedPaymentNotificationTemplateProps } from 'src/_context/PaymentNotification';
import NotificationsDetail from '../NotificationsDetail/NotificationsDetail';

type injectedClasses = 'container' | 'title' | 'description';

export type NotificationsListProps = WithStyles<injectedClasses> &
    InjectedIntlProps & InjectedPaymentNotificationTemplateProps & InjectedAuthProps;

type State = {
    editingOpened?: boolean;
    editing?: PaymentNotificationTemplate;
    creatingOpened?: boolean;
    creating?: PaymentNotificationTemplate;
};

class NotificationsList extends React.Component<NotificationsListProps, State> {
    constructor(props: NotificationsListProps) {
        super(props);

        this._add = this._add.bind(this);

        this.state = {};
    }

    render() {
        const { paymentNotificationsCtx, authCtx: {user}, intl, classes } = this.props;
        const { editing, editingOpened, creating, creatingOpened } = this.state;

        const addBtn: FabBtnProps = {
            icon: <Add />,
            legend: 'create new',
            themeColor: 'green',
            onClick: this._add
        };

        const hasRights = IsAdminOrInRole(user, 'CRUD_TEMPLATES');

        return (
            <GridContainer>
                {paymentNotificationsCtx.notifications.map(notification => {
                    const name = notification.Title || '(no title)';
                    const desciption = notification.Description || '';
                    return (
                        <Grid key={notification.Id} item={true} xs={12}>
                            <ItemPreview
                                onClick={hasRights ? () => {
                                    this.setState(() => ({ editing: notification, editingOpened: true }));
                                } : undefined}
                            >
                                <Avatar>
                                    <FileCopy />
                                </Avatar>
                                <Lines>
                                    <Line>
                                        <span className={classes.title}>
                                            {name}
                                        </span>
                                    </Line>
                                    <Line>
                                        {desciption &&
                                            <span className={classes.description}>
                                                {desciption}
                                            </span>}
                                    </Line>
                                </Lines>
                            </ItemPreview>
                        </Grid>);
                })}

                {editing &&
                    <SideDialog
                        open={!!editingOpened}
                        onClose={() => this.setState(() => ({ editingOpened: false }))}
                    >
                        <NotificationsDetail
                            paymentNotificationsCtx={paymentNotificationsCtx}
                            key={editing.Id}
                            changed={() => {
                                this.setState(() => ({ editingOpened: false }));
                            }}

                            onDelete={() => {
                                this.setState(() => ({ editingOpened: false }));
                            }}

                            cancel={() => {
                                this.setState(() => ({ editingOpened: false }));
                            }}

                            initial={editing}
                            intl={intl}
                        />

                    </SideDialog>
                }
                {creating &&
                    <SideDialog
                        open={!!creatingOpened}
                        onClose={() => this.setState(() => ({ creatingOpened: false }))}
                    >
                        <NotificationsDetail
                            paymentNotificationsCtx={paymentNotificationsCtx}
                            key={creating.Id}
                            changed={() => {
                                this.setState(() => ({ creatingOpened: false }));
                            }}

                            onDelete={() => {
                                this.setState(() => ({ creatingOpened: false }));
                            }}

                            cancel={() => {
                                this.setState(() => ({ creatingOpened: false }));
                            }}

                            initial={creating}
                            changes={creating}
                            intl={intl}
                        />
                    </SideDialog>
                }
                <Fabs map={[addBtn]} />
            </GridContainer>);
    }

    private _add() {
        PaymentNotifications.Empty('new notification', {})
            .then(newNotification => {
                this.setState(() => ({ creating: newNotification, creatingOpened: true }));
            });
    }
}

export default
    withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
        container: {
        },
        title: {
            color: 'black',
            marginRight: theme.spacing.unit
        },
        description: {
        }
    }))(NotificationsList);