import * as React from 'react';
import Dropzone from 'react-dropzone';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { InjectedIntlProps } from 'react-intl';
import { InjectedSettingsProps } from '../../../_context';

import ProductFieldsMessages from './ProductFieldsMessages';

import ItemPreview, { Lines, Thumb } from '../../ItemPreview/ItemPreview';
import { ProductOption } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import PricesField from 'src/components/PricesField/PricesField';

type ProductFieldsOptionProps = InjectedSettingsProps & InjectedIntlProps & {
    option: ProductOption;
    // onRemove: (options: ProductOption) => void;
    onChanged: (option: ProductOption) => void;
};

export const ProductFieldsOption: React.SFC<ProductFieldsOptionProps> = (props) => {
    const { option, onChanged, intl, settingsCtx } = props;

    const { Id, Title, BasePrice, SKU, Src } = option;

    const dropClassName = `product-fields__image-drop ${Src ? '' : 'product-fields__image-drop--no-src'}`;

    const onDrop = (acceptedFiles: Blob[]) => {
        const first = acceptedFiles[0];
        if (!first) { return; }
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                onChanged({ ...option, Src: reader.result as string });
            }
        };
        // tslint:disable-next-line:no-console
        reader.onabort = () => console.log('file reading was aborted');
        // tslint:disable-next-line:no-console
        reader.onerror = () => console.log('file reading has failed');

        reader.readAsDataURL(first);
        onChanged({ ...option, Blob: acceptedFiles[0] });
    };

    return (

        <ItemPreview noDividers={true}>
            <Thumb
                src={Src}
                style={{
                    backgroundColor: '#ddd'
                }}
            >
                <Dropzone
                    className={dropClassName}
                    onDrop={onDrop}
                />
            </Thumb>
            <Lines>

                <GridContainer spacing={24}>

                    <Grid item={true} xs={6}>
                        <TextField
                            onChange={(e) => onChanged({ ...option, Title: e.target.value })}
                            value={Title || ''}
                            fullWidth={true}
                            label={intl.formatMessage(ProductFieldsMessages.optionTitle)}
                        />
                    </Grid>
                    <Grid item={true} xs={3}>
                        <TextField
                            onChange={(e) => onChanged({ ...option, Id: e.target.value })}
                            value={Id || ''}
                            fullWidth={true}
                            label={intl.formatMessage(ProductFieldsMessages.optionId)}
                        />
                    </Grid>
                    <Grid item={true} xs={3}>
                        <TextField
                            onChange={(e) => onChanged({ ...option, SKU: e.target.value })}
                            value={SKU || ''}
                            fullWidth={true}
                            label={intl.formatMessage(ProductFieldsMessages.optionSKU)}
                        />
                    </Grid>
                    <PricesField
                        gridProps={{ xs: Math.max(4, 12 / settingsCtx.Settings.Currencies.length) as 12 | 6 | 4 }}
                        intl={intl}
                        onChange={(value) => onChanged({ ...option, BasePrice: value })}
                        value={BasePrice || []}
                        currencies={settingsCtx.Settings.Currencies}
                    />
                </GridContainer>
            </Lines>
        </ItemPreview>

    );
};

export default ProductFieldsOption;