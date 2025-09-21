import { createControllerAction } from '@/routes/utils';
import { send as sendVerification } from '@/routes/verification';

const EmailVerificationNotificationController = {
    store: createControllerAction(sendVerification(), 'post'),
};

export default EmailVerificationNotificationController;
