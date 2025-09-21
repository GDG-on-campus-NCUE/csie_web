import { createControllerAction } from '@/routes/utils';
import { update as updateRoute } from '@/routes/password';

const PasswordController = {
    update: createControllerAction(updateRoute(), 'put'),
};

export default PasswordController;
