import * as React from 'react';
import { Users } from '../_services';
import { User } from 'src/@types/our-orders';
import { InjectedAuthProps, withAuth } from '.';
import { Subtract } from 'utility-types';

export type UserContext = {
    Users: User[];
    update: () => void;
};
export type InjectedUsersProps = { usersCtx: UserContext };

const ReactUsersContext = React.createContext<UserContext>({
    Users: [],
    update: () => null as never
});
type UsersProviderProps =  InjectedAuthProps & {};

export class UsersProvider extends React.Component<UsersProviderProps, UserContext> {
    constructor(props: UsersProviderProps) {
        super(props);
        this.state = {
            Users: [],
            update: this._update.bind(this)
        };
    }

    componentDidMount() {
        this._update();
    }

    componentDidUpdate(prevProps: UsersProviderProps) {

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
            <ReactUsersContext.Provider value={this.state}>
                {this.props.children}
            </ReactUsersContext.Provider>
        );
    }

    private _setUsers(users: User[]) {
        this.setState(() => ({ Users: users }));
    }

    private _update() {
        Users.GetAll(0, 1000).then(result => this._setUsers(result.Values));
    }
}

export const withUsers =
    <OriginalProps extends InjectedUsersProps>(
        Component: React.ComponentType<OriginalProps>
    ): React.FunctionComponent<Subtract<OriginalProps, InjectedUsersProps>> => {

        return (props: Subtract<OriginalProps, InjectedUsersProps>) => {
            return (
                <ReactUsersContext.Consumer>
                    {(usersCtx) => <Component {...{ ...(props as object), usersCtx } as OriginalProps} />}
                </ReactUsersContext.Consumer>
            );
        };

    };

export const UsersProviderStandalone = withAuth(UsersProvider);
export default UsersProvider;