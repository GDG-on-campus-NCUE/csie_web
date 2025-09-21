import { createControllerAction, createRoute } from '@/routes/utils';

const ConfirmablePasswordController = {
    store: createControllerAction(createRoute('/confirm-password', 'post')),
};

export default ConfirmablePasswordController;
