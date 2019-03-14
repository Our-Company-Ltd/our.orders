import { User, Roles } from 'src/@types/our-orders';

export const IsAdminOrInRole = (user?: User, ...roles: Roles[]) => {
    return user && (
        user.Roles.indexOf('ADMIN') >= 0 || 
        roles.some(role => user.Roles.indexOf(role) >= 0));
};