import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import { DocumentTemplates } from '../../../../_services';
import { WithStyles, withStyles, Grid, Avatar } from '@material-ui/core';
import ItemPreview, { Lines, Line } from 'src/components/ItemPreview/ItemPreview';
import DocumentTemplateDetail from '../DocumentTemplateDetail/DocumentTemplateDetail';
import { DocumentTemplate } from 'src/@types/our-orders';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { Add, FileCopy } from '@material-ui/icons';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import { InjectedAuthProps } from 'src/_context';
import { IsAdminOrInRole } from 'src/_helpers/roles';

type injectedClasses = 'container' | 'title' | 'description';

export type DocumentTemplatesProps = WithStyles<injectedClasses> &
    InjectedIntlProps & InjectedTemplatesProps & InjectedAuthProps;

type State = {
    editingOpened?: boolean;
    editing?: DocumentTemplate;
    creatingOpened?: boolean;
    creating?: DocumentTemplate;
};

class DocumentTemplatesList extends React.Component<DocumentTemplatesProps, State> {
    constructor(props: DocumentTemplatesProps) {
        super(props);

        this._add = this._add.bind(this);

        this.state = {};
    }

    render() {
        const { templateCtx, authCtx: {user}, intl, classes } = this.props;
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
                {templateCtx.templates.map(documentTemplate => {
                    const name = documentTemplate.Title || '(no title)';
                    const desciption = documentTemplate.Description || '';
                    return (
                        <Grid key={documentTemplate.Id} item={true} xs={12}>
                            <ItemPreview
                                onClick={hasRights ? () => {
                                    this.setState(() => ({ editing: documentTemplate, editingOpened: true }));
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
                        <DocumentTemplateDetail
                            templateCtx={templateCtx}
                            key={editing.Id}
                            changed={(template) => {
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
                        <DocumentTemplateDetail
                            templateCtx={templateCtx}
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
        DocumentTemplates.Empty('new template', {})
            .then(newTemplate => {
                this.setState(() => ({ creating: newTemplate, creatingOpened: true }));
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
    }))(DocumentTemplatesList);