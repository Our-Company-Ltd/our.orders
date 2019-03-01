import * as React from 'react';
import { Categories } from '../_services';
import { Category } from 'src/@types/our-orders';
import { InjectedAuthProps, withAuth } from '.';
import { Subtract } from 'utility-types';

export type CategoryContext = {
    Categories: Category[];
    update: () => void;
    delete: (id: string) => Promise<string>;
    patch: (id: string, changes: Partial<Category>) => Promise<Category>;
    create: (changes: Partial<Category>) => Promise<Category>;
};
export type InjectedCategoryProps = { categoryCtx: CategoryContext };

const ReactCategoryContext = React.createContext<CategoryContext>({
    Categories: [],
    update: () => null as never,
    delete: (id: string) => null as never,
    patch: (id: string, changes: Partial<Category>) => null as never,
    create: (changes: Partial<Category>) => null as never
});
export type CategoryProviderProps = InjectedAuthProps & {

};
export class CategoryProvider extends React.Component<CategoryProviderProps, CategoryContext> {
    static Consumer: React.SFC<{ children: (context: CategoryContext) => React.ReactNode }> = (props) => {
        return <ReactCategoryContext.Consumer>{props.children}</ReactCategoryContext.Consumer>;
    }

    constructor(props: CategoryProviderProps) {
        super(props);

        this.state = {
            Categories: [],
            update: this._update.bind(this),
            delete: this._delete.bind(this),
            patch: this._patch.bind(this),
            create: this._create.bind(this)
        };
    }

    componentDidMount() {
        this._update();
    }

    componentDidUpdate(prevProps: CategoryProviderProps) {

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
            <ReactCategoryContext.Provider value={this.state}>
                {this.props.children}
            </ReactCategoryContext.Provider>
        );
    }

    private _setCategories(categories: Category[]) {
        this.setState(() => ({ Categories: categories }));
    }

    private _update() {
        Categories.Find({}, 0, 1000).then(result => this._setCategories(result.Values));
    }

    private _patch(id: string, changes: Partial<Category>) {
        return Categories
            .Patch(id, changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ Categories: prev.Categories.map(t => t.Id === model.Id ? model : t) }),
                    () => resolve(model)
                ));
            });
    }

    private _delete(id: string) {
        return Categories
            .Delete(id)
            .then(() => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ Categories: prev.Categories.filter(t => t.Id !== id) }),
                    () => resolve(id)
                ));
            });
    }

    private _create(changes: Partial<Category>) {
        return Categories
            .Create(changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ Categories: [...prev.Categories, model] }),
                    () => resolve(model)
                ));
            });
    }
}

export const withCategory =
    <P extends InjectedCategoryProps>(
        Component: React.ComponentType<P>
    ) => {
        return (props: Subtract<P, InjectedCategoryProps>) => {
            return (
                <ReactCategoryContext.Consumer>
                    {(categoryCtx) => <Component {...{ ...(props as object), categoryCtx } as P} />}
                </ReactCategoryContext.Consumer>
            );
        };
    };
export const CategoryProviderStandalone = withAuth(CategoryProvider);
export default CategoryProvider;