import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TextField from '@material-ui/core/TextField';
import TablePagination from '@material-ui/core/TablePagination';

import TableRow from '@material-ui/core/TableRow';
import { InjectedSettingsProps } from '../../_context/Settings';
import { InjectedWarehouseProps } from '../../_context/Warehouse';

import { StockUnits } from '../../_services';

import { StockUnit } from 'src/@types/our-orders';
import { Filter } from 'src/_helpers/Filter';
import { FilterDefinition } from 'src/_types/FilterDefinition';
import { IsAdminOrInRole } from 'src/_helpers/roles';
import { InjectedAuthProps } from 'src/_context';
import { Button } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { debounce } from 'throttle-debounce';

export type StockProps = InjectedSettingsProps & InjectedWarehouseProps & InjectedAuthProps & {

    skus: { sku: string; legend: string }[];
};
type State = {
    loading: boolean;
    units: StockUnit[];
    page: number;
};

export class Stock extends React.Component<StockProps, State> {
    constructor(props: StockProps) {
        super(props);
        this._onChange = debounce(300, this._onChange);
        this._onDelete = this._onDelete.bind(this);
        this._handleChangePage = this._handleChangePage.bind(this);
        const units: StockUnit[] = [];
        props.skus.forEach(sku => units.push({ Units: {}, SKU: sku.sku } as StockUnit));
        this.state = {
            loading: false,
            units: units,
            page: 0
        };
    }
    componentDidMount() {
        // fetch results :
        this._fetch();
    }
    render() {
        const { warehouseCtx, skus, authCtx: { user } } = this.props;
        const { units, page } = this.state;

        const rowCount = units.length;
        const rowsPerPage = 10;

        const hasRights = IsAdminOrInRole(user, 'CRUD_PRODUCTS');

        return (
            <React.Fragment>
                <Table aria-labelledby="tableTitle">
                    <TableHead>
                        <TableRow>

                            <TableCell numeric={false}>Product name</TableCell>
                            {warehouseCtx.Warehouses.map((s, i) => {
                                return (
                                    <TableCell
                                        key={s.Id}
                                        numeric={true}
                                    >
                                        {s.Name}
                                    </TableCell>
                                );
                            })}
                            <TableCell>delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {units
                            .filter((unit, i) => i >= page * rowsPerPage && i < (page + 1) * rowsPerPage)
                            .map(unit => {
                                const l = skus.find(s => s.sku === unit.SKU);
                                const title = l && l.legend || l && l.sku;
                                const { SKU } = unit;

                                return (<TableRow
                                    hover={true}
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={SKU}
                                >
                                    <TableCell component="th" scope="row" padding="none">
                                        {title}
                                    </TableCell>
                                    {warehouseCtx.Warehouses.map((s) => {
                                        var c = unit.Units && unit.Units[s.Id];
                                        return (
                                            <TableCell
                                                key={s.Id}
                                                numeric={true}
                                            >
                                                <TextField
                                                    value={c === null ? '' : c}
                                                    type="number"
                                                    fullWidth={true}
                                                    disabled={!hasRights}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        var val = e.target.value;
                                                        var stock = val === '' ? null : parseInt(val, 10);
                                                        this._onChange(unit, s.Id, stock);
                                                    }}
                                                />
                                            </TableCell>
                                        );

                                    })}
                                    <TableCell>
                                        <Button onClick={() => this._onDelete(unit)}>
                                            <Delete />
                                        </Button>
                                    </TableCell>
                                </TableRow>);
                            })}
                    </TableBody>
                </Table>
                {rowCount > rowsPerPage && <TablePagination
                    component="div"
                    count={rowCount}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                    page={page}
                    backIconButtonProps={{
                        'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'Next Page',
                    }}
                    onChangePage={this._handleChangePage}
                />}
            </React.Fragment>);
    }

    private _fetch() {
        const { skus } = this.props;
        const { loading } = this.state;
        if (loading) {
            return;
        }
        const filters = skus.map(sku => Filter.Eq('SKU', sku.sku));
        const def: FilterDefinition = { filters, operator: 'or', query: '', sort: '' };
        // TODO: infinte scroll or get them all;
        this.setState(() => ({ loading: true }), () => {
            StockUnits.Find(def, 0, 999999)
                .then(result => {
                    this.setState((prev) => {
                        const newUnits = [];
                        for (let i = 0; i < result.Values.length; i++) {
                            const unit = result.Values[i];
                            const similar = prev.units.findIndex(u => u.SKU === unit.SKU);
                            if (similar >= 0) {
                                prev.units.splice(similar, 1);
                            }
                            newUnits.push(unit);
                        }

                        return { loading: false, units: [...prev.units, ...newUnits] };
                    });
                });
        });

    }
    private _onChange(unit: StockUnit, shopId: string, value: number | null) {
        const { units } = this.state;

        const old = units.find(u => u === unit);
        if (!old) {
            // tslint:disable-next-line:no-console
            console.error('problem finding unit');
            return;
        }

        old.Units[shopId] = value || 0;

        this.setState(() => ({ loading: true }), () => {
            if (old.Id) {
                StockUnits.Patch(old.Id, old).then((newUnit) => {
                    this.setState((prev) => {
                        prev.units.splice(prev.units.indexOf(old), 1, newUnit);
                        return { loading: false, units: [...prev.units] };
                    });
                });
            } else {
                StockUnits.Create(old).then((newUnit) => {
                    this.setState((prev) => {
                        prev.units.splice(prev.units.indexOf(old), 1, newUnit);
                        return { loading: false, units: [...prev.units] };
                    });
                });
            }
        });

    }

    private _onDelete(unit: StockUnit) {
        const { units } = this.state;
        var confirm = window.confirm('Do you want to continue ?');

        this.setState(() => ({ loading: true }), () => {
            if (confirm && unit.Id) {
                StockUnits.Delete(unit.Id).then(() => {
                    const updatedUnits = units.filter(u => u !== unit);
                    this.setState(() => ({ loading: false, units: updatedUnits }));
                });
            }

            // to be explicit
            if (confirm && !unit.Id) {
                const updatedUnits = units.filter(u => u !== unit);
                this.setState(() => ({ loading: false, units: updatedUnits }));
            }
        });

    }

    private _handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
        this.setState({ page });
    }

}

export default Stock;