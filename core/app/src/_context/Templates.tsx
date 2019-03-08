import * as React from 'react';
import { DocumentTemplates } from '../_services';
import { DocumentTemplate } from 'src/@types/our-orders';
import { InjectedAuthProps, withAuth } from '.';
import { Subtract } from 'utility-types';

export type TemplatesContext = {
    templates: DocumentTemplate[];
    update: () => void;
    delete: (id: string) => Promise<string>;
    patch: (id: string, changes: Partial<DocumentTemplate>) => Promise<DocumentTemplate>;
    create: (changes: Partial<DocumentTemplate>) => Promise<DocumentTemplate>;
};
export type InjectedTemplatesProps = { templateCtx: TemplatesContext };

const ReactTemplatesContext = React.createContext<TemplatesContext>({
    templates: [],
    update: () => null as never,
    delete: (id: string) => null as never,
    patch: (id: string, changes: Partial<DocumentTemplate>) => null as never,
    create: (changes: Partial<DocumentTemplate>) => null as never
});
export type TemplatesProviderProps = InjectedAuthProps & {

};
export class TemplatesProvider extends React.Component<TemplatesProviderProps, TemplatesContext> {

    static Consumer: React.SFC<{ children: (context: TemplatesContext) => React.ReactNode }> = (props) => {
        return <ReactTemplatesContext.Consumer>{props.children}</ReactTemplatesContext.Consumer>;
    }

    constructor(props: TemplatesProviderProps) {
        super(props);

        this.state = {
            templates: [],
            update: this._update.bind(this),
            delete: this._delete.bind(this),
            patch: this._patch.bind(this),
            create: this._create.bind(this),
        };
    }

    componentDidMount() {
        this._update();
    }

    componentDidUpdate(prevProps: TemplatesProviderProps) {

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
            <ReactTemplatesContext.Provider value={this.state}>
                {this.props.children}
            </ReactTemplatesContext.Provider>
        );
    }

    private _setTemplates(templates: DocumentTemplate[]) {
        this.setState(() => ({ templates }));
    }

    private _update() {
        DocumentTemplates.Find({}, 0, 1000).then(result => this._setTemplates(result.Values));
    }

    private _patch(id: string, changes: Partial<DocumentTemplate>) {
        return DocumentTemplates
            .Patch(id, changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ templates: prev.templates.map(t => t.Id === model.Id ? model : t) }),
                    () => resolve(model)
                ));
            });
    }
    private _delete(id: string) {
        return DocumentTemplates
            .Delete(id)
            .then(() => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ templates: prev.templates.filter(t => t.Id !== id) }),
                    () => resolve(id)
                ));
            });
    }
    private _create(changes: Partial<DocumentTemplate>) {
        return DocumentTemplates
            .Create(changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ templates: [...prev.templates, model] }),
                    () => resolve(model)
                ));
            });
    }
}

export const withTemplates =
    <OriginalProps extends InjectedTemplatesProps>(
        Component: React.ComponentType<OriginalProps>
    ): React.FunctionComponent<Subtract<OriginalProps, InjectedTemplatesProps>> => {

        return (props: Subtract<OriginalProps, InjectedTemplatesProps>) => {
            return (
                <ReactTemplatesContext.Consumer>
                    {(templates) => <Component
                        {...{ ...(props as object), templateCtx: templates } as OriginalProps}
                    />}
                </ReactTemplatesContext.Consumer>
            );
        };

    };
export const TemplatesProviderStandalone = withAuth(TemplatesProvider);
export default TemplatesProvider;