import * as React from 'react';

import ItemPreview, { Line, Lines } from '../../ItemPreview/ItemPreview';
import { InjectedIntlProps, defineMessages } from 'react-intl';

import { LocationOn } from '@material-ui/icons';
import { Person, Order } from 'src/@types/our-orders';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { DialogContent, DialogActions, Button, Avatar } from '@material-ui/core';
import PersonFields from 'src/components/Person/PersonFields';
import { withSnackbar, InjectedNotistackProps } from 'notistack';

export type OrderShippingPersonProps =
    InjectedIntlProps &
    InjectedNotistackProps &
    {
        initial?: Person;
        onChange: (changes: Partial<Person>) => void;
        changes?: Partial<Person>;
        current: Order;
        hasRights: boolean;
    };

export const OrderShippingPersonMessages = defineMessages({
    empty: {
        id: 'src.components.forms.shipping.empty',
        defaultMessage: 'Devilery address',
        description: 'Placeholder for empty shipping person'
    },
    name: {
        id: 'src.components.forms.shipping.name',
        defaultMessage: 'Name',
        description: 'Placeholder for name shipping field'
    },
    address: {
        id: 'src.components.forms.shipping.address',
        defaultMessage: 'Adrress',
        description: 'Placeholder for empty shipping field'
    }
});
type State = {
    dialogOpened: boolean
};
class OrderShippingPersonFields extends React.Component<OrderShippingPersonProps, State> {
    constructor(props: OrderShippingPersonProps) {
        super(props);
        this._handleChange = this._handleChange.bind(this);
        this.state = { dialogOpened: false };

    }
    render() {
        const { intl, onChange, current: currentOrder, enqueueSnackbar, hasRights } = this.props;
        const { dialogOpened } = this.state;
        const initial = this.props.initial || {} as Person;
        const changes = this.props.changes || {};

        const current = { ...initial, ...changes };

        const firstname = current.FirstName || '';
        const lastname = current.LastName || '';
        const organizationname = current.OrganizationName || '';
        const address = current.Address || '';
        const city = current.City || '';
        const state = current.State || '';
        const postalcode = current.PostalCode || '';

        const empty = !(firstname || lastname || organizationname || address || city || state);
        const preview = empty ?
            (
                <ItemPreview>
                    <Avatar>
                        <LocationOn />
                    </Avatar>
                    <Lines>
                        <Line empty={true}>{this.props.intl.formatMessage(OrderShippingPersonMessages.name)}</Line>
                        <Line empty={true}>{this.props.intl.formatMessage(OrderShippingPersonMessages.address)}</Line>
                    </Lines>
                </ItemPreview>
            ) :
            (
                <ItemPreview>
                    <Avatar>
                        <LocationOn />
                    </Avatar>
                    <Lines>
                        <Line>{this.props.intl.formatMessage(OrderShippingPersonMessages.empty)}</Line>
                        <Line>
                            {firstname &&
                                <span className="client-fields__item client-fields__item--firstname">
                                    {firstname}
                                </span>}
                            {lastname &&
                                <span className="client-fields__item client-fields__item--lastname">
                                    {lastname}
                                </span>}
                        </Line>
                        <Line>
                            {address &&
                                <span className="client-fields__item client-fields__item--address">
                                    {address}
                                </span>}
                            {postalcode &&
                                <span className="client-fields__item client-fields__item--postalcode">
                                    {postalcode}
                                </span>}
                            {city &&
                                <span className="client-fields__item client-fields__item--city">
                                    {city}
                                </span>}
                        </Line>
                    </Lines>
                </ItemPreview>);
        const open = () => this.setState(() => ({ dialogOpened: true }));
        const close = () => this.setState(() => ({ dialogOpened: false }));
        const currentClient = currentOrder.Client;
        const copy = currentClient ?
            () => {
                onChange(currentClient);
                enqueueSnackbar(
                    // tslint:disable-next-line:max-line-length
                    `Successfully copied Client informations`,
                    { variant: 'success' }
                );
            } :
            null;
        return (
            <React.Fragment>

                <div
                    className="forms-fields__preview"
                    onClick={open}
                >
                    {preview}
                </div>

                <SideDialog
                    open={dialogOpened}
                    onClose={close}
                >
                    <DialogContent>
                        <PersonFields
                            current={initial}
                            onChange={this._handleChange}
                            intl={intl}
                            hasRights={hasRights}
                        />
                    </DialogContent>
                    <DialogActions>
                        {copy &&
                            <Button color="primary" variant="contained" onClick={copy}>copy from Client</Button>
                        }

                        <Button color="default" variant="contained" onClick={close}>close</Button>
                    </DialogActions>
                </SideDialog>
            </React.Fragment>);
    }

    private _handleChange(changes: Partial<Person>) {
        const person = { ...this.props.initial, ...changes } as Person;
        this.props.onChange(person);
    }
}

export default withSnackbar(OrderShippingPersonFields);