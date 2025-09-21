import { createControllerAction } from '@/routes/utils';
import { destroy as destroyRoute, update as updateRoute } from '@/routes/profile';

const ProfileController = {
    update: createControllerAction(updateRoute()),
    destroy: createControllerAction(destroyRoute()),
};

export default ProfileController;
