import { createRoute } from './utils';

export const send = () => createRoute('/email/verification-notification', 'post');

export default {
    send,
};
