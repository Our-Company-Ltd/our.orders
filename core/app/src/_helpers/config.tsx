const { protocol, hostname, port, pathname } = window.location;
const { REACT_APP_API_URL } = process.env;
const path = pathname.replace(/[^\.\/]+\.[^\.\/]+$/g, '').replace(/\/$/g, '');
export const config = {
    apiUrl: `${REACT_APP_API_URL ?
        REACT_APP_API_URL :
        `${protocol}//${hostname}:${port}${path}`
        }`
};