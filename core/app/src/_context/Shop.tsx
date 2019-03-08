import * as React from 'react';
import { Shops } from '../_services';
import { InjectedAuthProps, withAuth } from './Auth';
import { Shop } from 'src/@types/our-orders';
import { Subtract } from 'utility-types';

export type ShopContext = {
    Shops: Shop[];
    update: () => void;
    delete: (id: string) => Promise<string>;
    patch: (id: string, changes: Partial<Shop>) => Promise<Shop>;
    create: (changes: Partial<Shop>) => Promise<Shop>;
};
export type InjectedShopProps = { shopCtx: ShopContext };

const ReactShopContext = React.createContext<ShopContext>({
    Shops: [],
    update: () => null as never,
    delete: (id: string) => null as never,
    patch: (id: string, changes: Partial<Shop>) => null as never,
    create: (changes: Partial<Shop>) => null as never
});
type ShopProviderProps = InjectedAuthProps & {};

export class ShopProvider extends React.Component<ShopProviderProps, ShopContext> {

    static Consumer: React.SFC<{ children: (context: ShopContext) => React.ReactNode }> = (props) => {
        return <ReactShopContext.Consumer>{props.children}</ReactShopContext.Consumer>;
    }

    constructor(props: ShopProviderProps) {
        super(props);
        this.state = {
            Shops: [],
            update: this._update.bind(this),
            delete: this._delete.bind(this),
            patch: this._patch.bind(this),
            create: this._create.bind(this)
        };
    }

    componentDidMount() {
        this._update();
    }

    componentDidUpdate(prevProps: ShopProviderProps) {

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
            <ReactShopContext.Provider value={this.state}>
                {this.props.children}
            </ReactShopContext.Provider>
        );
    }

    private _setShops(shops: Shop[]) {
        this.setState(() => ({ Shops: shops }));
    }

    private _update() {
        Shops.Find({}, 0, 1000).then(result => this._setShops(result.Values));
    }
    private _patch(id: string, changes: Partial<Shop>) {
        return Shops
            .Patch(id, changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ Shops: prev.Shops.map(t => t.Id === model.Id ? model : t) }),
                    () => resolve(model)
                ));
            });
    }
    private _delete(id: string) {
        return Shops
            .Delete(id)
            .then(() => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ Shops: prev.Shops.filter(t => t.Id !== id) }),
                    () => resolve(id)
                ));
            });
    }
    private _create(changes: Partial<Shop>) {
        return Shops
            .Create(changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ Shops: [...prev.Shops, model] }),
                    () => resolve(model)
                ));
            });
    }
}

export const withShop =
    <OriginalProps extends InjectedShopProps>(
        Component: React.ComponentType<OriginalProps>
    ): React.FunctionComponent<Subtract<OriginalProps, InjectedShopProps>> => {

        return (props: Subtract<OriginalProps, InjectedShopProps>) => {
            return (
                <ReactShopContext.Consumer>
                    {(shopCtx) => <Component {...{ ...(props as object), shopCtx } as OriginalProps} />}
                </ReactShopContext.Consumer>
            );
        };

    };
export const ShopProviderStandalone = withAuth(ShopProvider);
export default ShopProvider;