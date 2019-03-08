import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import ShopsDetail from '../ShopsDetail/ShopsDetail';
import { Shops } from '../../../../_services';
import { WithStyles, Grid, withStyles, Avatar } from '@material-ui/core';
import ItemPreview, { Lines, Line } from '../../../ItemPreview/ItemPreview';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Add, Store } from '@material-ui/icons';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import { InjectedShopProps, InjectedAuthProps } from 'src/_context';
import { Shop } from 'src/@types/our-orders';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import { IsAdminOrInRole } from 'src/_helpers/roles';

type injectedClasses = 'container' | 'bold' | 'spacer';

export type ShopListProps =
    WithStyles<injectedClasses> &
    InjectedIntlProps &
    InjectedShopProps &
    InjectedAuthProps;

type State = {
    editingOpened?: boolean;
    editing?: Shop;
    creatingOpened?: boolean;
    creating?: Shop;
};

class ShopsList extends React.Component<ShopListProps, State> {

    constructor(props: ShopListProps) {
        super(props);

        this._add = this._add.bind(this);

        this.state = {};
    }

    render() {
        const { shopCtx, authCtx: { user }, intl, classes } = this.props;
        const { editing, editingOpened, creating, creatingOpened } = this.state;

        const addBtn: FabBtnProps = {
            icon: <Add />,
            legend: 'create new',
            themeColor: 'green',
            onClick: this._add
        };

        const hasRights = IsAdminOrInRole(user, 'CRUD_SHOPS');

        return (
            <GridContainer>
                {shopCtx.Shops.map(shop => {
                    const name = shop.Name || '';
                    const city = shop.City || '';

                    const email = shop.Email || '';
                    const phone = shop.Phone || '';

                    return (
                        <Grid key={shop.Id} item={true} xs={12}>
                            <ItemPreview
                                onClick={hasRights ? () => {
                                    this.setState(() => ({ editing: shop, editingOpened: true }));
                                } : undefined}
                            >

                                <Avatar>
                                    <Store />
                                </Avatar>
                                <Lines>
                                    <Line>
                                        {name &&
                                            <span className={classNames(classes.bold, classes.spacer)}>
                                                {name}
                                            </span>}
                                        {city &&
                                            <span>
                                                {city}
                                            </span>}
                                    </Line>
                                    <Line>
                                        {email &&
                                            <span className={classes.spacer}>
                                                {email}
                                            </span>}
                                        {phone &&
                                            <span>
                                                {phone}
                                            </span>}
                                    </Line>
                                </Lines>
                            </ItemPreview>
                        </Grid>);
                })}

                <SideDialog
                    open={!!editingOpened}
                    onClose={() => this.setState(() => ({ editingOpened: false }))}
                >
                    {editing &&
                        <ShopsDetail
                            key={editing.Id}
                            shopCtx={shopCtx}
                            changed={(shop) => {
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
                        />}
                </SideDialog>

                <SideDialog
                    open={!!creatingOpened}
                    onClose={() => this.setState(() => ({ editingOpened: false }))}
                >
                    {creating &&
                        <ShopsDetail
                            key={creating.Id}
                            shopCtx={shopCtx}
                            changed={(shop) => {
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
                {hasRights &&
                    <Fabs map={[addBtn]} />
                }
            </GridContainer >
        );
    }

    private _add() {
        Shops.Empty('New Shop', {})
            .then(newShop => {
                this.setState(() => ({ creating: newShop, creatingOpened: true }));
            });
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
    container: {

    },
    bold: {
        fontWeight: 'bold',
        color: 'black'
    },
    spacer: {
        marginRight: '.4rem'
    }
}))(ShopsList);