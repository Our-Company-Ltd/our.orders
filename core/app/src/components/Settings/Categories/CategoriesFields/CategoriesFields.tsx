
import * as React from 'react';

import { Grid, TextField } from '@material-ui/core';
import { InjectedIntlProps } from 'react-intl';
import CategoriesDetailMessages from '../CategoriesDetail/CategoriesDetailMessages';
import { Category } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';

type TCategory = Category;

type Props = InjectedIntlProps & {
    initial: TCategory;
    onChange: (shop: Partial<TCategory>) => void;
    changes: Partial<TCategory>;
};

class CategoriesFields extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }
    render() {
        return this._renderUser();
    }

    private _renderUser() {
        const initial = this.props.initial;
        const preview = { ...initial, ...this.props.changes } as TCategory;

        return (
            <GridContainer>
                <Grid item={true} xs={12} className="warehouses-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(e) => this.props.onChange({ Title: e.target.value })}
                        value={preview.Title || ''}
                        label={this.props.intl.formatMessage(CategoriesDetailMessages.title)}
                    />
                </Grid>
            </GridContainer>);
    }
}

export default CategoriesFields;