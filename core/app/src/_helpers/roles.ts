import { User, Roles } from 'src/@types/our-orders';

export const IsAdminOrInRole = (user?: User, ...roles: string[]) => {
    return user && (
        roles.some(role => user.Roles.indexOf(Roles.Admin) >= 0) || 
        roles.some(role => user.Roles.indexOf(role) >= 0));
};