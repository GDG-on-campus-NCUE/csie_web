import { createControllerAction, createRoute } from '@/routes/utils';

const RegisteredUserController = {
    store: createControllerAction(createRoute('/register', 'post')),
};

export default RegisteredUserController;
