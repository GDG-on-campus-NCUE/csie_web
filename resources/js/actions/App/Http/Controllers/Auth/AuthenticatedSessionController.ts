import { createControllerAction, createRoute } from '@/routes/utils';

const AuthenticatedSessionController = {
    store: createControllerAction(createRoute('/login', 'post')),
    destroy: createControllerAction(createRoute('/logout', 'post')),
};

export default AuthenticatedSessionController;
