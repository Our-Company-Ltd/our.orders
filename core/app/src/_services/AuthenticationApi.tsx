import { config, handleApiResponse, addAuthHeader } from '../_helpers';
import { User } from 'src/@types/our-orders';

export const Authenticate = (username: string, password: string): Promise<User> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    return fetch(`${config.apiUrl}/account/authenticate`, addAuthHeader(requestOptions))
        .then<User>(handleApiResponse)
        .then(user => {
            return user;
        });
};

export const Logout = (): Promise<void> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    return fetch(`${config.apiUrl}/account/logout`, addAuthHeader(requestOptions))
        .then<User>(handleApiResponse)
        .then(user => {
            return;
        });
};

export const Reset = (username: string): Promise<User> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    };

    return fetch(`${config.apiUrl}/account/reset`, addAuthHeader(requestOptions))
        .then<User>(handleApiResponse);
};

export const ConfirmRegister = (id: string, code: string, password: string): Promise<User> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, code, password })
    };

    return fetch(`${config.apiUrl}/account/reset`, addAuthHeader(requestOptions))
        .then<User>(handleApiResponse);
};

export const ChangePassword = (currentPassword: string, newPassword: string): Promise<void> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
    };

    return fetch(`${config.apiUrl}/account/changePassword`, addAuthHeader(requestOptions))
        .then<User>(handleApiResponse)
        .then(user => {
            return;
        });
};

export const GetUser = (): Promise<User> => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    return fetch(`${config.apiUrl}/account/current`, addAuthHeader(requestOptions))
        .then<User>(handleApiResponse)
        .then(user => {
            return user;
        });
};

export const PatchUser = (changes: Partial<User>): Promise<User> => {
    const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));
    const requestOptions = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pathModel)
    };

    const url = `${config.apiUrl}/account`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<User>(handleApiResponse)
        .then(response => {
            return response;
        });
};

export const Register = (email: string): Promise<User> => {

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
    };

    const url = `${config.apiUrl}/account/register`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<User>(handleApiResponse)
        .then(response => {
            return response;
        });
};

export const Setup = (userName: string, password: string, changes?: Partial<User>): Promise<User> => {
    const pathModel = changes && Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserName: userName, Password: password, Patch: pathModel })
    };

    const url = `${config.apiUrl}/account/setup`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<User>(handleApiResponse)
        .then(response => {
            return response;
        });
};
