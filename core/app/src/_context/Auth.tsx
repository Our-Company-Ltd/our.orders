import * as React from 'react';
import { Authenticate, Logout, Reset, GetUser, ConfirmRegister, Setup } from '../_services';
import { User, ApiModel } from 'src/@types/our-orders';
import { Subtract } from 'utility-types';

export const LOCALSTORAGE_KEY = 'Auth';

const storedUserJson = localStorage.getItem(LOCALSTORAGE_KEY);

export const InitUser = storedUserJson ? JSON.parse(storedUserJson) as User : undefined;

export type AuthProviderProps = {

};

export type AuthContext = {
    loggedin?: boolean;
    user?: User;
    needSetup?: boolean;

    error?: boolean;
    fetching?: boolean;

    setup: (username: string, password: string, changes?: Partial<User>) => Promise<User | undefined>;
    login: (username: string, password: string) => Promise<User | undefined>;
    logout: () => void;
    refresh: () => void;
    reset: (username: string) => void;
    confirmRegister: (userId: string, key: string, password: string) => Promise<User>;
};

const ReactAuthContext = React.createContext<AuthContext>({
    login: () => ({}) as never,
    logout: () => ({}) as never,
    refresh: () => ({}) as never,
    reset: () => ({}) as never,
    confirmRegister: () => ({}) as never,
    setup: () => ({}) as never
});

export class AuthProvider extends React.Component<AuthProviderProps, AuthContext> {
    static Inject = <P extends AuthContext>(
        UnwrappedComponent: React.ComponentType<P>
    ) =>
        class WithAuth extends React.Component<
            Exclude<P, AuthContext>
            > {
            render() {
                return (
                    <AuthProvider.Consumer>
                        {(context) => {
                            return <UnwrappedComponent {...this.props} {...context} />;
                        }
                        }
                    </AuthProvider.Consumer>
                );
            }
        }
    static Consumer: React.SFC<{ children: (context: AuthContext) => React.ReactNode }> = (props) => {
        return <ReactAuthContext.Consumer>{props.children}</ReactAuthContext.Consumer>;
    }

    constructor(props: AuthProviderProps) {
        super(props);
        this.state = {
            user: InitUser,
            loggedin: undefined,

            login: this._login.bind(this),
            logout: this._logout.bind(this),
            reset: this._reset.bind(this),
            refresh: this._refresh.bind(this),
            setup: this._setup.bind(this),
            confirmRegister: this._confirmRegister.bind(this),
        };
    }

    componentDidMount() {
        this._refresh();
    }

    render() {
        return (
            <ReactAuthContext.Provider value={this.state}>
                {this.props.children}
            </ReactAuthContext.Provider>
        );
    }

    private _login(username: string, password: string) {
        this.setState(() => ({ fetching: true }));
        return new Promise<User>((resolve, reject) =>
            Authenticate(username, password)
                .then(user => {
                    if (!user) {
                        this.setState(() => ({ fetching: false, error: true, loggedin: false, user: undefined }));
                        throw new Error();
                    }
                    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(user));

                    this.setState(() => ({ fetching: false, error: false, loggedin: true, user: user }));
                    return user;
                })
                .then(resolve)
                .catch((reason) => {
                    this.setState(() => ({ fetching: false, error: true, loggedin: false, user: undefined }));
                    reject(reason);
                }))
            ;
    }

    private _logout() {
        this.setState(() => ({ fetching: true }));
        return Logout()
            .then(() => {
                localStorage.removeItem(LOCALSTORAGE_KEY);
                this.setState(() => ({ fetching: false, error: false, loggedin: false, user: undefined }));
            }).catch(() => {
                this.setState(() => ({ fetching: false, error: true, user: undefined }));
            });
    }

    private _reset(username: string) {
        this.setState(() => ({ fetching: true }));
        return Reset(username)
            .then(() => {
                localStorage.removeItem(LOCALSTORAGE_KEY);
                this.setState(() => ({ fetching: false, error: false, loggedin: false, user: undefined }));
            }).catch(() => {
                this.setState(() => ({ fetching: false, error: true, user: undefined }));
            });
    }
    private _confirmRegister(userId: string, key: string, password: string) {
        this.setState(() => ({ fetching: true }));
        return new Promise<User>((resolve, reject) =>
            ConfirmRegister(userId, key, password)
                .then((user) => {
                    localStorage.removeItem(LOCALSTORAGE_KEY);
                    this.setState(() => ({ fetching: false, error: false, loggedin: false, user: undefined }));
                    return user;
                })
                .then((user) => this._login(user.UserName, password))
                .then(resolve)
                .catch((resp) => {
                    this.setState(() => ({ fetching: false, error: true, user: undefined }));
                    reject(resp);
                }));
    }
    private _setup(username: string, password: string, changes?: Partial<User>) {
        this.setState(() => ({ fetching: true }));
        return new Promise<User>((resolve, reject) =>
            Setup(username, password, changes)
                .then((user) => {
                    localStorage.removeItem(LOCALSTORAGE_KEY);
                    this.setState(() => ({ fetching: false, error: false, loggedin: false, user: undefined }));
                    return user;
                })
                .then((user) => this._login(user.UserName, password))
                .then(resolve)
                .catch((resp) => {
                    this.setState(() => ({ fetching: false, error: true, user: undefined }));
                    reject(resp);
                }));
    }

    private _refresh() {
        this.setState(() => ({ fetching: true }));
        return GetUser()
            .then((user) => {
                if (!user) {
                    localStorage.removeItem(LOCALSTORAGE_KEY);
                    this.setState(() => ({ fetching: false, error: false, loggedin: false, user: undefined }));
                    return;
                }

                const oldUser = this.state.user || {} as User;
                const { Token } = oldUser;
                const newUser = { ...user, Token };
                localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newUser));
                this.setState(() => ({ fetching: false, error: false, loggedin: true, user: newUser }));
                return user;

            }).catch((o: ApiModel<string>) => {
                this.setState(() => ({
                    fetching: false, 
                    needSetup: o.Value === 'setup', 
                    error: false, 
                    loggedin: false, 
                    user: undefined
                }));
            });
    }

}

export type InjectedAuthProps = { authCtx: AuthContext };
export const withAuth =
    <OriginalProps extends InjectedAuthProps>(
        Component: React.ComponentType<OriginalProps>
    ): React.FunctionComponent<Subtract<OriginalProps, InjectedAuthProps>> => {

        return (props: Subtract<OriginalProps, InjectedAuthProps>) => {
            return (
                <ReactAuthContext.Consumer>
                    {(authCtx) => <Component {...{ ...(props as object), authCtx } as OriginalProps} />}
                </ReactAuthContext.Consumer>
            );
        };

    };

export default AuthProvider;