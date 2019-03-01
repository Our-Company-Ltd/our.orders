
import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import { DocumentTemplate } from 'src/@types/our-orders';
import DocumentTemplateFields from '../DocumentTemplateFields/DocumentTemplateFields';
import { DialogContent, DialogActions, Button } from '@material-ui/core';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import { Delete } from '@material-ui/icons';
import DocumentTemplateDetailMessages from './DocumentTemplateDetailMessages';

export type DocumentTemplateDetailProps = InjectedTemplatesProps & InjectedIntlProps & {
    initial: DocumentTemplate;
    changed: (category: DocumentTemplate) => void;
    onDelete: () => void;
    cancel: () => void;
    changes?: Partial<DocumentTemplate>;
};

type State = {
    changes: Partial<DocumentTemplate>;
};

class DocumentTemplateDetail extends React.Component<DocumentTemplateDetailProps, State> {
    constructor(props: DocumentTemplateDetailProps) {
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
                        <DocumentTemplateFields
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
        const { templateCtx: templates, onDelete, intl: { formatMessage } } = this.props;

        const isTodelete = window.confirm(formatMessage(DocumentTemplateDetailMessages.deleteConfirm));

        if (isTodelete) {
            templates
                .delete(id)
                .then(onDelete);
        }
    }
    private _OnSave(modif: Partial<DocumentTemplate>) {
        const {
            props: { initial: { Id }, templateCtx: templates, changed },
            state: { changes }
        } = this;
        const allChanges = { ...changes, ...modif };

        if (Id) {
            return templates
                .patch(Id, allChanges)
                .then(model => {
                    this.setState(() => ({
                        initial: model,
                        changes: {}
                    }));
                    changed(model);
                });
        } else {
            return templates
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

export default DocumentTemplateDetail;