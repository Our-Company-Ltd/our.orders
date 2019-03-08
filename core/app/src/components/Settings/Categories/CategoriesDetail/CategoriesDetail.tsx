
import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import { Category } from 'src/@types/our-orders';
import CategoriesFields from '../CategoriesFields/CategoriesFields';
import { DialogContent, DialogActions, Button } from '@material-ui/core';
import { InjectedCategoryProps } from 'src/_context/Category';
import { Delete } from '@material-ui/icons';
import CategoriesDetailMessages from './CategoriesDetailMessages';

type Props = & InjectedIntlProps & InjectedCategoryProps & {
    initial: Category;
    changed: (category: Category) => void;
    onDelete: () => void;
    cancel: () => void;
    changes?: Partial<Category>;
};

type State = {
    changes: Partial<Category>;
};

class CategoriesDetail extends React.Component<Props, State> {
    constructor(props: Props) {
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
                        <CategoriesFields
                            intl={intl}
                            initial={initial}
                            onChange={(category) => {
                                this.setState(prev => {
                                    return ({ changes: { ...prev.changes, ...category } });
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
        const { categoryCtx: Categories, onDelete, intl: { formatMessage } } = this.props;
        const isTodelete = window.confirm(formatMessage(CategoriesDetailMessages.deleteConfirm));

        if (isTodelete) {
            Categories
                .delete(id)
                .then(onDelete);
        }
    }

    private _OnSave(modif: Partial<Category>) {

        const {
            props: { initial: { Id }, categoryCtx: Categories, changed },
            state: { changes }
        } = this;
        const allChanges = { ...changes, ...modif };

        if (Id) {
            return Categories
                .patch(Id, allChanges)
                .then(model => {
                    this.setState(() => ({
                        initial: model,
                        changes: {}
                    }));
                    changed(model);
                });
        } else {
            return Categories
                .create(allChanges)
                .then(model => {
                    this.setState(() => ({
                        initial: model,
                        changes: {}
                    }));
                    this.props.changed(model);
                });
        }
    }
}

export default CategoriesDetail;