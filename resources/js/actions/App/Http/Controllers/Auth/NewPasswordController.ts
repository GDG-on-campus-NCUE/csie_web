import { createControllerAction } from '@/routes/utils';
import { store as storeRoute } from '@/routes/password';

const NewPasswordController = {
    store: createControllerAction(storeRoute(), 'post'),
};

export default NewPasswordController;
