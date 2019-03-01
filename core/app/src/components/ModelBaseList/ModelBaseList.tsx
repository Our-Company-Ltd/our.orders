import * as React from 'react';
import { ServiceApi } from '../../_services';
import { Subtract } from 'utility-types';
import { ModelBase } from 'src/@types/our-orders';
import { FilterDefinition } from 'src/_types/FilterDefinition';

export type ModelBaseListProps<TModel extends ModelBase> = {
    api: ServiceApi<TModel>;
    step: number;
    children: (context: Readonly<ListContext<TModel>>) => React.ReactNode;
};

export type ListContext<TModel extends ModelBase> = {
    edit: (id: string) => Promise<TModel>;
    delete: (id: string) => Promise<boolean>;
    get: (id: string) => Promise<TModel>;
    refresh: (id?: string) => Promise<void>;
    fetch: (id?: string) => Promise<void>;
    create: (empty: TModel) => Promise<TModel>;
    close: () => Promise<void>;
    filterAndSort: (filter: FilterDefinition) => Promise<void>;
    loadMore: () => Promise<void>;

    entries: TModel[];

    loading: boolean;
    done: boolean;

    filters: FilterDefinition;

    editing?: TModel;
    creating?: TModel;

};

export abstract class ModelBaseList<TModel extends ModelBase>
    extends React.Component<ModelBaseListProps<TModel>, ListContext<TModel>> {
    constructor(props: ModelBaseListProps<TModel>) {
        super(props);
        this.state = {
            edit: this._edit.bind(this),
            refresh: this._refresh.bind(this),
            delete: this._delete.bind(this),
            create: this._create.bind(this),
            fetch: this._fetch.bind(this),
            close: this._close.bind(this),
            get: this._get.bind(this),
            loadMore: this._loadMore.bind(this),
            filterAndSort: this._filterAndSort.bind(this),
            loading: false,
            done: false,
            entries: [],
            filters: { filters: [], query: '', operator: 'and', sort: '' },
        };
    }
    componentDidMount() {
        this._loadMore();
    }
    render() {
        return this.props.children(this.state);
    }
    private _filterAndSort(filters: FilterDefinition) {
        this.setState(
            () => ({
                filters
            }),
            () => {
                this._refresh();
            });
    }

    private _create(empty: TModel) {
        const { loading } = this.state;
        if (loading) {
            return;
        }

        return new Promise<TModel>(
            (resolve) => {
                this.setState(
                    () =>
                        ({
                            loading: true
                        })
                    ,
                    () => {
                        this.setState(
                            () => ({
                                editing: undefined,
                                creating: empty,
                                loading: false
                            }),
                            () => resolve(empty)
                        );
                    }
                );
            });
    }
    private _close() {
        return new Promise<TModel>(
            (resolve) => {
                this.setState(
                    () =>
                        ({
                            editing: undefined,
                            creating: undefined
                        })
                    ,
                    resolve
                );
            });
    }
    private _delete(id: string) {
        const { api } = this.props;

        return api.Delete(id)
            .then(() => {
                return new Promise<boolean>(
                    (resolve) => {
                        this.setState(
                            (prev) => ({
                                entries: prev.entries.filter(e => e.Id !== id),
                                creating: prev.creating && prev.creating.Id === id ? undefined : prev.creating,
                                editing: prev.editing && prev.editing.Id === id ? undefined : prev.editing,
                            }),
                            () => resolve(true)
                        );
                    });
            });
    }
    private _fetch(start: number) {

        const { filters } = this.state;
        const { api, step } = this.props;
        return api.Find(filters, start, start + step)
            .then((result) =>
                new Promise<void>(
                    (resolve) => {
                        this.setState(
                            (prev) => {
                                const newEntries = [...prev.entries];
                                newEntries.splice(start);

                                return {
                                    entries: [...newEntries, ...result.Values]
                                };
                            },
                            () => resolve()
                        );
                    })
            );
    }
    private _loadMore() {
        const { entries } = this.state;

        return this._fetch(entries.length);
    }

    private _refresh(id?: string) {
        const { api } = this.props;
        if (id) {
            return api.Get(id).then((value) =>
                new Promise<void>(
                    (resolve) => {
                        this.setState(
                            (prev) => ({
                                entries: prev.entries.map(e => e.Id === id ? value : e)
                            }),
                            () => resolve()
                        );
                    })
            );
        } else {
            return this._fetch(0);
        }

    }
    private _get(id: string) {
        const { api } = this.props;
        const { entries } = this.state;
        const entry = entries.find(e => e.Id === id);
        if (entry) {
            return Promise.resolve(entry);
        } else {
            return api.Get(id);
        }
    }

    private _edit(id: string) {

        return this._get(id).then((value) =>
            new Promise<TModel>(
                (resolve) => {
                    this.setState(
                        (prev) => ({
                            creating: undefined,
                            editing: value
                        }),
                        () => resolve(value)
                    );
                })
        );
    }
}
export type InjectedListProps<TModel extends ModelBase> = { list: ListContext<TModel> };
export const withList =
    <P extends InjectedListProps<TModel>, TModel extends ModelBase>(
        UnwrappedComponent: React.ComponentType<P>,
        api: ServiceApi<TModel>) => {
        type listView = new () => ModelBaseList<TModel>;

        const ListView = ModelBaseList as listView;
        return class WithList extends React.Component<Subtract<P, InjectedListProps<TModel>>> {
            render() {
                return (
                    <ListView api={api} step={50}>
                        {(list) => <UnwrappedComponent {...{...(this.props as object), list} as P} />}
                    </ListView>
                );
            }
        };
    };

export default ModelBaseList;