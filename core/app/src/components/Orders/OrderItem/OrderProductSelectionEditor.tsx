import * as React from 'react';

import {
    defineMessages,
    InjectedIntlProps,
    FormattedNumber
} from 'react-intl';

import { Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { ProductSelection, Product, Price } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';

export const OrderProductSelectionEditorMessages = defineMessages({
    quantity: {
        id: 'src.components.OrderProductSelectionEditorMessages.quantity',
        defaultMessage: 'quantity',
        description: 'quantity'
    },
    value: {
        id: 'src.components.OrderProductSelectionEditorMessages.value',
        defaultMessage: 'value',
        description: 'value'
    },
    title: {
        id: 'src.components.OrderProductSelectionEditorMessages.title',
        defaultMessage: 'title',
        description: 'title'
    },
    option: {
        id: 'src.components.OrderProductSelectionEditorMessages.option',
        defaultMessage: 'option',
        description: 'option'
    },
    optionValue: {
        id: 'src.components.OrderProductSelectionEditorMessages.optionValue',
        defaultMessage: 'optionValue',
        description: 'optionValue'
    },
});

export const OrderProductSelectionEditor: React.SFC<
    InjectedIntlProps &
    {
        selection: ProductSelection;
        currency: string;
        product: Product;
        onChange: (selection: ProductSelection) => void;
    }> = (props) => {
        const { intl, selection: { Quantity, Option }, selection, onChange } = props;

        const getPrice = (bp: Price[]) =>
            bp && bp.length && (bp.find(p => p.Currency === props.currency) || bp[0]);

        const hasOptions = props.product.Options && props.product.Options.length > 0;
        return (
            <GridContainer>
                <Grid item={true} xs={2}>
                    <TextField
                        label={intl.formatMessage(OrderProductSelectionEditorMessages.quantity)}
                        value={Quantity || 0}
                        type="number"
                        fullWidth={true}
                        onChange={(e) => {
                            const val = (e.target as HTMLInputElement).value;
                            const q = val === '' ? 0 : parseInt(val, 10);
                            onChange({ ...props.selection, Quantity: q });
                        }}
                    />
                </Grid>
                <Grid item={true} xs={hasOptions ? 4 : 10}>
                    <TextField
                        label={intl.formatMessage(OrderProductSelectionEditorMessages.title)}
                        value={props.product.Title || ''}
                        fullWidth={true}
                        disabled={true}
                    />
                </Grid>
                {hasOptions &&
                    <React.Fragment>
                        <Grid item={true} xs={3}>
                            <FormControl fullWidth={true}>
                                <InputLabel htmlFor="selectOption">
                                    {intl.formatMessage(OrderProductSelectionEditorMessages.option)}
                                </InputLabel>
                                <Select
                                    fullWidth={true}
                                    value={(Option && Option.index) || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...selection, Option:
                                            {
                                                index: parseInt(e.target.value, 10),
                                                value: (selection.Option && selection.Option.value) || ''
                                            }
                                        })
                                    }
                                    inputProps={{
                                        name: 'selectOption',
                                        id: 'selectOption',
                                    }}
                                >
                                    {props.product.Options!.map((opt, i) => {
                                        const price = getPrice(opt.BasePrice);
                                        return (<MenuItem key={i} value={i}>
                                            <span>{opt.Title}</span>
                                            {price && price.Value > 0 ?
                                                    <span style={{ fontStyle: 'italic', marginLeft: '0.2rem' }}>
                                                        (+ <FormattedNumber
                                                            style="currency"
                                                            currency={price.Currency}
                                                            value={price.Value}
                                                        />)
                                                </span> : null
                                            }
                                        </MenuItem>);
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item={true} xs={3}>
                            <TextField
                                label={intl.formatMessage(OrderProductSelectionEditorMessages.optionValue)}
                                value={(Option && Option.value) || ''}
                                fullWidth={true}
                                onChange={(e) =>
                                    onChange({
                                        ...selection, Option:
                                        {
                                            index: (selection.Option && selection.Option.index) || -1,
                                            value: e.target.value
                                        }
                                    })
                                }
                            />
                        </Grid>
                    </React.Fragment>
                }
            </GridContainer>);
    };
