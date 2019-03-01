import * as React from 'react';
import { Warehouses } from '../_services';
import { Warehouse } from 'src/@types/our-orders';
import { InjectedAuthProps, withAuth } from '.';
import { Subtract } from 'utility-types';

export type WarehouseContext = {
    Warehouses: Warehouse[];
    update: () => void;
    delete: (id: string) => Promise<string>;
    patch: (id: string, changes: Partial<Warehouse>) => Promise<Warehouse>;
    create: (changes: Partial<Warehouse>) => Promise<Warehouse>;
};
export type InjectedWarehouseProps = { warehouseCtx: WarehouseContext };

const ReactWarehouseContext = React.createContext<WarehouseContext>({
    Warehouses: [],
    update: () => null as never,
    delete: (id: string) => null as never,
    patch: (id: string, changes: Partial<Warehouse>) => null as never,
    create: (changes: Partial<Warehouse>) => null as never
});
export type WarehouseProviderProps = InjectedAuthProps & {

};
export class WarehouseProvider extends React.Component<WarehouseProviderProps, WarehouseContext> {

    static Consumer: React.SFC<{ children: (context: WarehouseContext) => React.ReactNode }> = (props) => {
        return <ReactWarehouseContext.Consumer>{props.children}</ReactWarehouseContext.Consumer>;
    }

    constructor(props: WarehouseProviderProps) {
        super(props);

        this.state = {
            Warehouses: [],
            update: this._update.bind(this),
            delete: this._delete.bind(this),
            patch: this._patch.bind(this),
            create: this._create.bind(this)
        };
    }

    componentDidMount() {
        this._update();
    }

    componentDidUpdate(prevProps: WarehouseProviderProps) {

        const { authCtx: { user } } = this.props;
        const { authCtx: { user: prevUser } } = prevProps;
        const id = user && user.Id;
        const prevId = prevUser && prevUser.Id;
        if (id !== prevId) {
            this._update();
        }
    }
    render() {
        return (
            <ReactWarehouseContext.Provider value={this.state}>
                {this.props.children}
            </ReactWarehouseContext.Provider>
        );
    }

    private _setWarehouses(warehouses: Warehouse[]) {
        this.setState(() => ({ Warehouses: warehouses }));
    }

    private _update() {
        Warehouses.Find({}, 0, 1000).then(result => this._setWarehouses(result.Values));
    }
    
    private _patch(id: string, changes: Partial<Warehouse>) {
        return Warehouses
            .Patch(id, changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ Warehouses: prev.Warehouses.map(t => t.Id === model.Id ? model : t) }),
                    () => resolve(model)
                ));
            });
    }
    private _delete(id: string) {
        return Warehouses
            .Delete(id)
            .then(() => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ Warehouses: prev.Warehouses.filter(t => t.Id !== id) }),
                    () => resolve(id)
                ));
            });
    }
    private _create(changes: Partial<Warehouse>) {
        return Warehouses
            .Create(changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ Warehouses: [...prev.Warehouses, model] }),
                    () => resolve(model)
                ));
            });
    }
}

export const withWarehouse =
    <OriginalProps extends InjectedWarehouseProps>(
        Component: React.ComponentType<OriginalProps>
    ): React.FunctionComponent<Subtract<OriginalProps, InjectedWarehouseProps>> => {

        return (props: Subtract<OriginalProps, InjectedWarehouseProps>) => {
            return (
                <ReactWarehouseContext.Consumer>
                    {(warehouseCtx) => <Component {...{ ...(props as object), warehouseCtx } as OriginalProps} />}
                </ReactWarehouseContext.Consumer>
            );
        };

    };
export const WarehouseProviderStandalone = withAuth(WarehouseProvider);
export default WarehouseProvider;