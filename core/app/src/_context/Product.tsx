import * as React from 'react';
import { Products } from '../_services';
import { ProductPreview } from 'src/@types/our-orders';
import { InjectedAuthProps, withAuth } from '.';
import { Subtract } from 'utility-types';

export type ProductContext = {
    products: ProductPreview[];
    update: () => Promise<void>;
    fetching: boolean;
};
export type InjectedProductProps = { productCtx: ProductContext };

const ReactProductContext = React.createContext<ProductContext>({
    products: [],
    update: () => Promise.resolve(),
    fetching: false
});
export type ProductProviderProps = InjectedAuthProps & {

};
export class ProductProvider extends React.Component<ProductProviderProps, ProductContext> {

    static Consumer: React.SFC<{ children: (context: ProductContext) => React.ReactNode }> = (props) => {
        return <ReactProductContext.Consumer>{props.children}</ReactProductContext.Consumer>;
    }

    constructor(props: ProductProviderProps) {
        super(props);

        this.state = {
            products: [],
            update: this._update.bind(this),
            fetching: false
        };
    }

    componentDidMount() {
        this._update();
    }

    componentDidUpdate(prevProps: ProductProviderProps) {

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
            <ReactProductContext.Provider value={this.state}>
                {this.props.children}
            </ReactProductContext.Provider>
        );
    }

    private _update() {
        return new Promise(
            (resolve) => {
                this.setState(
                    () => ({ fetching: true }),
                    () => {
                        Products.Previews()
                            .then(products => {
                                this.setState(
                                    () => ({ products, fetching: false }),
                                    resolve);
                            });
                    });
            });
    }
}

export const withProduct =
    <OriginalProps extends InjectedProductProps>(
        Component: React.ComponentType<OriginalProps>
    ): React.FunctionComponent<Subtract<OriginalProps, InjectedProductProps>> => {

        return (props: Subtract<OriginalProps, InjectedProductProps>) => {
            return (
                <ReactProductContext.Consumer>
                    {(productCtx) => <Component {...{ ...(props as object), productCtx } as OriginalProps} />}
                </ReactProductContext.Consumer>
            );
        };

    };
export const ProductProviderStandalone = withAuth(ProductProvider);
export default ProductProvider;