import { createControllerAction } from '@/routes/utils';
import { email as emailRoute } from '@/routes/password';

const PasswordResetLinkController = {
    store: createControllerAction(emailRoute(), 'post'),
};

export default PasswordResetLinkController;
