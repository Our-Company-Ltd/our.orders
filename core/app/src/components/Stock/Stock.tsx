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

export type StockProps = InjectedSettingsProps & InjectedWarehouseProps & InjectedAuthProps & {

    skus: { sku: string; legend: string }[];
};
type State = {
    loading: boolean;
    units: { [sku: string]: StockUnit | undefined };
    page: number;
};

export class Stock extends React.Component<StockProps, State> {
    constructor(props: StockProps) {
        super(props);
        this._onChange = this._onChange.bind(this);
        this._handleChangePage = this._handleChangePage.bind(this);
        const units: { [sku: string]: StockUnit | undefined } = {};
        props.skus.forEach(sku => units[sku.sku] = undefined);
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
        const { warehouseCtx, skus, authCtx: {user} } = this.props;
        const { units, page } = this.state;

        const rowCount = Object.keys(units).length;
        const rowsPerPage = 10;

        const hasRights = IsAdminOrInRole(user, 'CRUD_PRODUCTS');
        
        return (
            <React.Fragment>
                <Table aria-labelledby="tableTitle">
                    <TableHead>
                        <TableRow>

                            <TableCell

                                numeric={false}
                            >
                                Product name
                            </TableCell>
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {skus
                            .filter((sku, i) => i >= page * rowsPerPage && i < (page + 1) * rowsPerPage)
                            .map(sku => {
                                const title = sku.legend || sku.sku;
                                const unit = units[sku.sku] ||
                                    { Id: '', Name: '', SKU: sku.sku, Units: {}, Detail: '' } as StockUnit;
                                const { SKU } = unit;
                                return (
                                    <TableRow
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
                                                            this._onChange(SKU, s.Id, stock);
                                                        }}
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>);
                            }
                            )}

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
        const { loading, units } = this.state;
        if (loading) {
            return;
        }
        const filters = skus.map(sku => Filter.Eq('SKU', sku.sku));
        const def: FilterDefinition = { filters, operator: 'or', query: '', sort: '' };
        // TODO: infinte scroll or get them all;
        this.setState(() => ({ loading: true }), () => {
            StockUnits.Find(def, 0, 999999)
                .then(result => {
                    result.Values.forEach(v => units[v.SKU] = v);
                    this.setState(() => ({ units, loading: false }));
                });
        });

    }
    private _onChange(sku: string, shopId: string, value: number | null) {
        const { units } = this.state;

        const old = units[sku] || { SKU: sku, Units: {} } as StockUnit;
        old.Units[shopId] = value || 0;

        this.setState(() => ({ loading: true }), () => {
            if (old.Id) {
                StockUnits.Patch(old.Id, old).then((newUnit) => {
                    this.setState((prev) => ({ loading: false, units: { ...prev.units, [sku]: newUnit } }));
                });
            } else {
                StockUnits.Create(old).then((newUnit) => {
                    this.setState((prev) => ({ loading: false, units: { ...prev.units, [sku]: newUnit } }));
                });
            }
        });

    }

    private _handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
        this.setState({ page });
    }

}

export default Stock;