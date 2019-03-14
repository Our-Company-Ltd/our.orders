import { InjectedIntlProps, FormattedMessage } from 'react-intl';
import Dropzone from 'react-dropzone';
import * as React from 'react';

import { InjectedSettingsProps, InjectedAuthProps } from '../../../_context';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import DeleteIcon from '@material-ui/icons/Delete';

import ItemPreview, { Line, Lines, Thumb } from '../../ItemPreview/ItemPreview';
import ColorHash from 'color-hash';

import ProductFieldsMessages from './ProductFieldsMessages';

import {
    ExpansionPanelActions,
    Button,
    Divider,
    FormControl,
    InputLabel,
    Select,
    Input,
    Chip,
    MenuItem,
    FormControlLabel,
    Switch,
    WithStyles,
    withStyles
} from '@material-ui/core';
import ProductFieldsOption from './ProductFieldsOption';
import { Product, ProductOption } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { InjectedCategoryProps } from 'src/_context/Category';
import PricesField from 'src/components/PricesField/PricesField';
import NumberField from 'src/components/NumberField/NumberField';
import { StyleRules } from '@material-ui/core/styles';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export type injectedClasses =
    'dropZone' |
    'dropZoneNoImage' |
    'dropZoneLabel';

export type ProductFieldsProps =
    WithStyles<injectedClasses> &
    InjectedIntlProps &
    InjectedSettingsProps &
    InjectedCategoryProps &
    InjectedAuthProps &
    {
        initial: Product;
        changes: Partial<Product>;
        onChange: (product: Partial<Product>) => void;
        subProduct?: boolean;
    };
type State = {
    expandedIndex?: number;
};
class ProductFields extends React.Component<ProductFieldsProps, State> {
    constructor(props: ProductFieldsProps) {
        super(props);
        this._onDrop = this._onDrop.bind(this);
        this.state = {};
    }

    render() {
        const {
            intl,
            initial,
            classes,
            changes,
            authCtx: { user },
            settingsCtx,
            subProduct,
            categoryCtx,
            settingsCtx: {
                Settings: {
                    ShowWeight,
                    ShowTaxRateExcluded,
                    ShowTaxRateIncluded
                }
            }
        } = this.props;

        const preview = { ...initial, ...changes } as Product;

        const currencies = settingsCtx.Settings.Currencies;

        const sku = preview.SKU || '';
        const title = preview.Title || '';
        const basePrice = preview.BasePrice || [];
        const weight = preview.Weight;
        const minQuantity = preview.MinQuantity;
        const maxQuantity = preview.MaxQuantity;
        const taxRateExcluded = preview.TaxRateExcluded;
        const taxRateIncluded = preview.TaxRateIncluded;
        const NeedsDispatch = preview.NeedsDispatch;
        const categories = preview.Categories || [];
        const description = preview.Description || '';
        const colorHash = new ColorHash();
        const options = preview.Options;

        const hasRights = IsAdminOrInRole(user, 'CRUD_PRODUCTS');

        return (
            <GridContainer>
                <Grid item={true} xs={12}>
                    <ItemPreview noDividers={true}>
                        <Dropzone
                            className={classes.dropZone}
                            onDrop={this._onDrop}
                            disabled={!hasRights}
                        >
                            <Thumb
                                src={preview.Src}
                                style={{ backgroundColor: colorHash.hex(preview.Id) }}
                            >

                                <label className={classes.dropZoneLabel} />

                            </Thumb>
                        </Dropzone>
                        <Lines>
                            <Line className={'forms-fields'}>
                                <GridContainer>
                                    <Grid item={true} xs={9}>
                                        <TextField
                                            onChange={this._handleChange('Title')}
                                            value={title}
                                            fullWidth={true}
                                            label={intl.formatMessage(ProductFieldsMessages.title)}
                                            disabled={!hasRights}
                                        />
                                    </Grid>
                                    <Grid item={true} xs={3}>
                                        <TextField
                                            onChange={this._handleChange('SKU')}
                                            value={sku}
                                            fullWidth={true}
                                            label={intl.formatMessage(ProductFieldsMessages.sku)}
                                            disabled={!hasRights}
                                        />
                                    </Grid>
                                </GridContainer>
                            </Line>
                        </Lines>
                    </ItemPreview>

                </Grid>
                <PricesField
                    gridProps={{ xs: Math.max(4, 12 / currencies.length) as 12 | 6 | 4 }}
                    intl={this.props.intl}
                    onChange={(value) => this._OnChange({ BasePrice: value })}
                    value={basePrice}
                    currencies={currencies}
                    fieldProps={{ disabled: !hasRights }}
                />
                {ShowWeight &&
                    <Grid item={true} xs={4}>
                        <NumberField
                            label={intl.formatMessage(ProductFieldsMessages.weight)}
                            value={weight === null ? '' : weight}
                            step="0.01"
                            fullWidth={true}
                            onNumberChange={(w) => {
                                this._OnChange({ Weight: w });
                            }}
                            disabled={!hasRights}
                        />
                    </Grid>
                }
                <Grid item={true} xs={4}>
                    <TextField
                        label={intl.formatMessage(ProductFieldsMessages.minQuantity)}
                        value={minQuantity === null ? '' : minQuantity}
                        type="number"
                        fullWidth={true}
                        onChange={(e) => {
                            var val = (e.target as HTMLInputElement).value;
                            var min = val === '' ? null : parseInt(val, 10);
                            this._OnChange({ MinQuantity: min });
                        }}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={4}>
                    <TextField
                        label={intl.formatMessage(ProductFieldsMessages.maxQuantity)}
                        value={maxQuantity === null ? '' : maxQuantity}
                        type="number"
                        fullWidth={true}
                        onChange={(e) => {
                            var val = (e.target as HTMLInputElement).value;
                            var max = val === '' ? null : parseInt(val, 10);
                            this._OnChange({ MaxQuantity: max });
                        }}
                        disabled={!hasRights}
                    />
                </Grid>
                {ShowTaxRateIncluded &&
                    <Grid item={true} xs={4}>
                        <NumberField
                            label={intl.formatMessage(ProductFieldsMessages.taxRateIncluded)}
                            value={taxRateIncluded === null ? '' : taxRateIncluded}
                            step="0.01"
                            fullWidth={true}
                            onNumberChange={(w) => {
                                this._OnChange({ TaxRateIncluded: w });
                            }}
                            disabled={!hasRights}
                        />
                    </Grid>}
                {ShowTaxRateExcluded &&
                    <Grid item={true} xs={4}>
                        <NumberField
                            label={intl.formatMessage(ProductFieldsMessages.taxRateExcluded)}
                            value={taxRateExcluded === null ? '' : taxRateExcluded}
                            step="0.01"
                            fullWidth={true}
                            onNumberChange={(w) => {
                                this._OnChange({ TaxRateExcluded: w });
                            }}
                            disabled={!hasRights}
                        />
                    </Grid>
                }
                <Grid item={true} xs={4}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!NeedsDispatch}
                                onChange={(e) =>
                                    this.props.onChange({ ...changes, NeedsDispatch: e.target.checked })}
                                color="primary"
                                disabled={!hasRights}
                            />}
                        label={intl.formatMessage(ProductFieldsMessages.needsDispatch)}
                    />
                </Grid>
                {!subProduct &&
                    <Grid item={true} xs={12}>
                        <FormControl fullWidth={true}>
                            <InputLabel htmlFor="select-categories">
                                <FormattedMessage {...ProductFieldsMessages.categories} />
                            </InputLabel>
                            <Select
                                fullWidth={true}
                                multiple={true}
                                value={categories}
                                disabled={!hasRights}
                                // tslint:disable-next-line:no-any
                                onChange={(e: any) => this._OnChange({ Categories: e.target.value })}
                                input={<Input id="select-categories" />}
                                renderValue={cats => (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {(cats as string[]).map(value => {
                                            const cat = categoryCtx.Categories.find(c => c.Id === value);
                                            return cat ?
                                                (<Chip
                                                    key={cat.Id}
                                                    label={cat.Title}
                                                    style={{
                                                        marginRight: '5px'
                                                    }}
                                                />) :
                                                null;
                                        }
                                        )}
                                    </div>)
                                }
                            >
                                {categoryCtx.Categories.map(cat => {
                                    const selected = categories.indexOf(cat.Id) >= 0;
                                    return (
                                        <MenuItem
                                            key={cat.Id}
                                            value={cat.Id}
                                            style={{
                                                fontWeight: selected ? 'bold' : 'inherit'
                                            }}
                                        >
                                            {cat.Title}
                                        </MenuItem>);
                                }
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                }
                <Grid item={true} xs={12}>
                    <TextField
                        onChange={this._handleChange('Description')}
                        multiline={true}
                        fullWidth={true}
                        value={description}
                        label={intl.formatMessage(ProductFieldsMessages.description)}
                        disabled={!hasRights}
                    />
                </Grid>

                {options && options.length > 0 &&
                    <Grid item={true} xs={12}>
                        {options && options.map((option, i) =>
                            this._renderOption(options, option, i)
                        )}
                    </Grid>}

                {hasRights && <Grid item={true} xs={12} >
                    <GridContainer justify="center">
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => this._addOption(options || [])}
                        >
                            <FormattedMessage {...ProductFieldsMessages.addOption} />
                            <PlaylistAddIcon style={{ paddingLeft: '7px' }} />
                        </Button>
                    </GridContainer>
                </Grid>}
            </GridContainer>

        );
    }
    private _handleChange(name: keyof (Product)) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            this.props.onChange({
                [name]: e.target.value
            });
        };
    }
    private _renderOption(list: ProductOption[], current: ProductOption, index: number) {
        const { settingsCtx, intl } = this.props;
        const { expandedIndex } = this.state;
        const expanded = expandedIndex === index;

        return (
            <ExpansionPanel
                key={index}
                expanded={expanded}
                onChange={() => this.setState(() => ({ expandedIndex: expanded ? undefined : index }))}
            >
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <div>
                        {current.Title}
                    </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <ProductFieldsOption
                        settingsCtx={settingsCtx}
                        intl={intl}
                        option={current}
                        onChanged={(l) => this._changeOption(list, index, l)}
                    />
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions>
                    <Button
                        size="small"
                        color="secondary"
                        variant="contained"
                        onClick={() => this._removeOption(list, index)}
                    >
                        <FormattedMessage {...ProductFieldsMessages.removeOption} />
                        <DeleteIcon />
                    </Button>
                </ExpansionPanelActions>
            </ExpansionPanel >);
    }
    private _changeOption(
        current: ProductOption[],
        optionIndex: number,
        change: Partial<ProductOption>
    ) {
        const Options = current.map((o, i) => i !== optionIndex ? o : { ...o, ...change });
        this.props.onChange({ Options });
    }
    private _removeOption(
        current: ProductOption[],
        optionIndex: number
    ) {
        const Options = current.filter((o, i) => i !== optionIndex);
        this.props.onChange({ Options });
    }

    private _addOption(current: ProductOption[]) {
        const { intl: { formatMessage } } = this.props;
        const { emptyOptionTitle } = ProductFieldsMessages;

        const emptyOption = {
            Title: formatMessage(emptyOptionTitle, { number: (current.length + 1) }),
            Id: '',
            Src: '',
            SKU: '',
            BasePrice: []
        };

        const Options = [
            ...current,
            emptyOption
        ];
        this.setState(() => ({ expandedIndex: (Options.length - 1) }));
        this.props.onChange({ Options });
    }

    private _onDrop(acceptedFiles: Blob[]) {
        const first = acceptedFiles[0];
        if (!first) { return; }
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                this.props.onChange({ Src: reader.result as string });
            }
        };
        // tslint:disable-next-line:no-console
        reader.onabort = () => console.log('file reading was aborted');
        // tslint:disable-next-line:no-console
        reader.onerror = () => console.log('file reading has failed');

        reader.readAsDataURL(first);
        this.props.onChange({ Blob: acceptedFiles[0] });
    }

    private _OnChange(change: Partial<Product>) {
        this.props.onChange(change);
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    return {
        dropZone: {
            width: 'auto',
            height: '100%'
        },
        dropZoneNoImage: {
        },
        dropZoneLabel: {
            width: '100%',
            height: '100%'
        }
    };
})(ProductFields);