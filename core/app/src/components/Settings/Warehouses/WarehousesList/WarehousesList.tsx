import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import { Warehouses } from '../../../../_services';
import { WithStyles, Grid, withStyles, Avatar } from '@material-ui/core';
import ItemPreview, { Lines, Line } from 'src/components/ItemPreview/ItemPreview';
import WarehousesDetail from '../WarehousesDetail/WarehousesDetail';
import { Warehouse } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Add } from '@material-ui/icons';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import { InjectedWarehouseProps, InjectedAuthProps } from 'src/_context';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import WarehouseIcon from 'src/components/Products/ProductDetail/WarehouseIcon';
import { IsAdminOrInRole } from 'src/_helpers/roles';

type injectedClasses = 'container' | 'bold' | 'spacer';

export type WarehouseProps =
    WithStyles<injectedClasses> &
    InjectedIntlProps &
    InjectedWarehouseProps &
    InjectedAuthProps;

type State = {
    editingOpened?: boolean;
    editing?: Warehouse;
    creatingOpened?: boolean;
    creating?: Warehouse;
};

class WarehousesList extends React.Component<WarehouseProps, State> {

    constructor(props: WarehouseProps) {
        super(props);
        this._add = this._add.bind(this);
        this.state = {};
    }

    render() {
        const { warehouseCtx, authCtx, authCtx: { user }, intl, classes } = this.props;
        const { editing, editingOpened, creating, creatingOpened } = this.state;

        const addBtn: FabBtnProps = {

            icon: <Add />,
            legend: 'create new',
            themeColor: 'green',
            onClick: this._add
        };

        const hasRights = IsAdminOrInRole(user, 'CRUD_Warehouses');

        return (
            <GridContainer>
                {warehouseCtx.Warehouses.map(warehouse => {
                    const name = warehouse.Name || '';
                    const city = warehouse.City || '';

                    const email = warehouse.Email || '';
                    const phone = warehouse.Phone || '';

                    return (
                        <Grid key={warehouse.Id} item={true} xs={12}>
                            <ItemPreview
                                onClick={hasRights ?
                                    () => {
                                        this.setState(() => ({ editing: warehouse, editingOpened: true }));
                                    } : undefined}
                            >
                                <Avatar>
                                    <WarehouseIcon />
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
                    {editing && <WarehousesDetail
                        key={editing.Id}
                        warehouseCtx={warehouseCtx}
                        authCtx={authCtx}
                        changed={(warehouse) => {
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
                    }
                </SideDialog>
                <SideDialog
                    open={!!creatingOpened}
                    onClose={() => this.setState(() => ({ editingOpened: false }))}
                >
                    {creating &&
                        <WarehousesDetail
                            key={creating.Id}
                            warehouseCtx={warehouseCtx}
                            authCtx={authCtx}
                            changed={(warehouse) => {
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
                    <Fabs
                        map={[addBtn]}
                    />
                }
            </GridContainer>
        );
    }

    private _add = () => {
        Warehouses.Empty('New Warehouse', {})
            .then(newWarehouse => {
                this.setState(() => ({ creating: newWarehouse, creatingOpened: true }));
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
        marginRight: 10
    }
}))(WarehousesList);