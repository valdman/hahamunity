import {Router, Request} from 'express';
import {mongoose, ReturnModelType} from '@typegoose/typegoose';

import '~/entities';

import {generateCRUD} from './crud';
import {AnyParamConstructor} from '@typegoose/typegoose/lib/types';
import {User} from '~/entities/user';
import {Post} from '~/entities/post';

const {modelNames, model: _model} = mongoose;

const routers: Record<string, Router> = {};

export function createAdminCRUD(): Router {
    const router = routers['adminCrud'] || Router();
    routers['adminCrud'] = router;

    const mongooseModels = modelNames();

    mongooseModels.forEach((currentModel) => {
        const model = _model(currentModel);
        generateCRUD(router, currentModel, model);
    });

    return router;
}

export function createModelCRUD<R, T extends AnyParamConstructor<R>>(modelName: string, model: typeof mongoose.Model| ReturnModelType<T>): Router {
    const name = `${modelName}_crud_router`;
    const router = routers[name] || Router();
    routers[name] = router;

    generateCRUD(router, '', model, {
        isCreateRestricted: true,
        isUpdateRestricted: true,
        isDeleteRestricted: true,
    }, verifyOwnership);

    return router;
}

function verifyOwnership(req: Request, object: unknown) {
    if(!object) return false;
    const {email: userEmail = ''} = (req.user as User) || {};
    const postIsh = object as Post;
    if(userEmail && (postIsh?.authorEmail === userEmail)) return true;
    return false;
}
