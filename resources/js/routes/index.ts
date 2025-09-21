import { createRoute } from './utils';

export const home = () => createRoute('/');
export const dashboard = () => createRoute('/dashboard');
export const login = () => createRoute('/login');
export const register = () => createRoute('/register');
export const logout = () => createRoute('/logout', 'post');

export default {
    home,
    dashboard,
    login,
    register,
    logout,
};
