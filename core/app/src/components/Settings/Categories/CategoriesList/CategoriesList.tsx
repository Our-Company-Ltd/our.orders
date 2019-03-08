import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import { Categories } from '../../../../_services';
import { WithStyles, withStyles, Grid, Avatar } from '@material-ui/core';
import ItemPreview, { Lines, Line } from 'src/components/ItemPreview/ItemPreview';
import CategoriesDetail from '../CategoriesDetail/CategoriesDetail';
import { Category } from 'src/@types/our-orders';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { Add, Bookmarks } from '@material-ui/icons';
import { InjectedCategoryProps } from 'src/_context/Category';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';

type injectedClasses = 'container' | 'bold' | 'spacer';

export type CategoriesProps = WithStyles<injectedClasses> &
    InjectedIntlProps & InjectedCategoryProps;

type State = {
    editingOpened?: boolean;
    editing?: Category;
    creatingOpened?: boolean;
    creating?: Category;
};

class CategoriesList extends React.Component<CategoriesProps, State> {

    constructor(props: CategoriesProps) {
        super(props);

        this._add = this._add.bind(this);

        this.state = {};
    }

    render() {
        const { categoryCtx, intl, classes } = this.props;
        const { editing, editingOpened, creating, creatingOpened } = this.state;

        const addBtn: FabBtnProps = {
            icon: <Add />,
            legend: 'create new',
            themeColor: 'green',
            onClick: this._add
        };

        return (
            <GridContainer>
                {
                    categoryCtx.Categories.map(category => {
                        const name = category.Title || '(no title)';
                        return (
                            <Grid key={category.Id} item={true} xs={12}>
                                <ItemPreview
                                    onClick={() => {
                                        this.setState(() => ({ editing: category, editingOpened: true }));
                                    }}
                                >
                                    <Avatar>
                                        <Bookmarks />
                                    </Avatar>
                                    <Lines>
                                        <Line>
                                            <span className={classes.bold}>
                                                {name}
                                            </span>
                                        </Line>
                                    </Lines>
                                </ItemPreview>
                            </Grid>);
                    })
                }
                <SideDialog
                    open={!!editingOpened}
                    onClose={() => this.setState(() => ({ editingOpened: false }))}
                >
                    {editing && <CategoriesDetail
                        key={editing.Id}
                        categoryCtx={categoryCtx}
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
                        intl={this.props.intl}
                    />
                    }
                </SideDialog>
                <SideDialog
                    open={!!creatingOpened}
                    onClose={() => this.setState(() => ({ editingOpened: false }))}
                >
                    {creating &&
                        <CategoriesDetail
                            key={creating.Id}
                            categoryCtx={categoryCtx}
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
                        />}
                </SideDialog>
                <Fabs map={[addBtn]} />
            </GridContainer >);
    }

    private _add() {
        Categories.Empty('new category', {})
            .then(newCategory => {
                this.setState(() => ({ creating: newCategory, creatingOpened: true }));
            });
    }
}

export default
    withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
        container: {
        },
        bold: {
            fontWeight: 'bold',
            color: 'black'
        },
        spacer: {
            marginRight: 10
        }
    }))(CategoriesList);