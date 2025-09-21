import { createRoute } from './utils';

export const edit = () => createRoute('/settings/password');
export const update = () => createRoute('/settings/password', 'put');
export const request = () => createRoute('/forgot-password');
export const email = () => createRoute('/forgot-password', 'post');
export const reset = (token: string) => createRoute(`/reset-password/${token}`);
export const store = () => createRoute('/reset-password', 'post');

export default {
    edit,
    update,
    request,
    email,
    reset,
    store,
};
