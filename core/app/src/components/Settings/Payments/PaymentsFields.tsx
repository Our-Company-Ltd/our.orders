import * as React from 'react';
import {
    Grid,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    TextField,
    Divider,
    ExpansionPanelActions,
    Button,
    Switch,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    List
} from '@material-ui/core';

import { InjectedIntlProps } from 'react-intl';
import { InjectedSettingsProps } from 'src/_context';
import { Setting } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Check, Close, ExpandMore, Delete, PlaylistAdd } from '@material-ui/icons';
import Fabs from 'src/components/Fabs/Fabs';
import { withSnackbar, InjectedNotistackProps } from 'notistack';
import NumberField from 'src/components/NumberField/NumberField';

export type PaymentsFieldsProps =
    InjectedIntlProps &
    InjectedSettingsProps &
    InjectedNotistackProps & {
        initial: Setting;
    };

type State = {
    initial: Setting;
    changes: Partial<Setting>;

    expandedIndex?: number;
};

class PaymentsFields extends React.Component<PaymentsFieldsProps, State> {
    constructor(props: PaymentsFieldsProps) {
        super(props);

        this.state = {
            changes: {},
            initial: props.initial
        };
    }

    render() {
        const { initial, changes, expandedIndex } = this.state;

        const preview = { ...initial, ...changes } as Setting;

        const changed = !!Object.keys(changes).length;

        return (
            <React.Fragment>
                <GridContainer>
                    <Grid item={true} xs={12}>
                        {preview.Currencies.map((currency, index) =>
                            <ExpansionPanel
                                key={index}
                                expanded={expandedIndex === index}
                                onChange={() => this.setState(() =>
                                    ({ expandedIndex: expandedIndex === index ? undefined : index }))}
                            >
                                <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                                    <div>
                                        {currency.Name} - {currency.Code} - {currency.Rate}
                                    </div>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <TextField
                                        label={'currency name'}
                                        value={currency.Name || ''}
                                        onChange={(e) => {
                                            var v = [...preview.Currencies];
                                            v[index] = { ...v[index], Name: e.target.value };
                                            this._HandleChange({ Currencies: v });
                                        }}
                                    />
                                    <TextField
                                        label={'currency code'}
                                        value={currency.Code || ''}
                                        onChange={(e) => {
                                            var v = [...preview.Currencies];
                                            v[index] = { ...v[index], Code: e.target.value };
                                            this._HandleChange({ Currencies: v });
                                        }}
                                    />
                                    <NumberField
                                        label={'currency rate'}
                                        value={currency.Rate || 0}
                                        step="0.01"
                                        onNumberChange={(value) => {
                                            var v = [...preview.Currencies];
                                            v[index] = { ...v[index], Rate: value };
                                            this._HandleChange({ Currencies: v });
                                        }}
                                    />
                                </ExpansionPanelDetails>
                                <Divider />
                                <ExpansionPanelActions>
                                    <Button
                                        size="small"
                                        color="secondary"
                                        variant="contained"
                                        onClick={() => {
                                            var v = [...preview.Currencies];
                                            v.splice(index, 1);
                                            this._HandleChange({ Currencies: v });
                                        }}
                                    >
                                        remove currency
                                        <Delete />
                                    </Button>
                                </ExpansionPanelActions>
                            </ExpansionPanel>
                        )}
                    </Grid>
                    <Grid item={true} xs={12} >
                        <GridContainer justify="center">
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => {
                                    var v = [...preview.Currencies, { Name: '', Code: '', Rate: 1 }];
                                    this._HandleChange({ Currencies: v });
                                }}
                            >
                                add option
                                <PlaylistAdd style={{ paddingLeft: '7px' }} />
                            </Button>
                        </GridContainer>
                    </Grid>
                    <Grid item={true} xs={12}>
                        <List>
                            {preview.PaymentProviders.map((paymentProvider) =>
                                <ListItem
                                    key={paymentProvider}
                                >
                                    <ListItemText primary={paymentProvider} />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={preview.HidePaymentProviders.indexOf(paymentProvider) < 0}
                                            onChange={(e) => {
                                                var { checked } = e.target;
                                                this.setState(() =>
                                                    ({
                                                        changes: {
                                                            HidePaymentProviders: !checked ?
                                                                [...preview.HidePaymentProviders, paymentProvider]
                                                                    .filter((elem, pos, arr) => {
                                                                        return arr.indexOf(elem) === pos;
                                                                    }) :
                                                                preview.HidePaymentProviders
                                                                    .filter(p => p !== paymentProvider)
                                                        }
                                                    }));
                                            }}
                                            value="Hide"
                                        />
                                    </ListItemSecondaryAction>

                                </ListItem>
                            )}
                        </List>
                    </Grid>
                    {preview.HidePaymentProviders.indexOf('transfer') < 0 &&
                        <Grid item={true} xs={12}>
                            <TextField
                                fullWidth={true}
                                multiline={true}
                                label="bank transfer message"
                                value={preview.TransferMessage || ''}
                                onChange={(e) =>
                                    this._HandleChange({ TransferMessage: e.target.value })
                                }
                            />
                        </Grid>
                    }
                </GridContainer>

                {changed &&
                    <Fabs
                        map={[{
                            icon: <Check />,
                            onClick: () => { this._HandleSave(); },
                            legend: 'save',
                            color: 'primary',
                            themeColor: 'green',
                        },
                        {
                            icon: <Close />,
                            legend: 'cancel',
                            onClick: () => { this._HandleCancel(); }
                        }]}
                    />
                }
            </React.Fragment>
        );
    }

    private _HandleChange(changes: Partial<Setting>) {
        const newChanges = { ...this.state.changes, ...changes };
        this.setState(() => ({ changes: newChanges }));
    }

    private _HandleSave() {
        const { settingsCtx: { update }, enqueueSnackbar } = this.props;
        const { changes } = this.state;
        if (!Object.keys(changes).length) {
            return;
        }

        update(changes)
            .then((model) => {
                this.setState(
                    () => ({
                        changes: {},
                        initial: model
                    }),
                    () => {
                        enqueueSnackbar('configuration updated with success', { variant: 'success' });
                    });
            })
            .catch((reason) =>
                enqueueSnackbar(`error while updating configuration (${reason})`, { variant: 'error' })
            );

    }
    private _HandleCancel() {
        this.setState(() => ({
            changes: {},
            initial: { ...this.props.initial }
        }));
    }
}

export default withSnackbar(PaymentsFields);