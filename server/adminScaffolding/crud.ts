import {Router, Request} from 'express';

import {
    getOne,
    getMany,
    create,
    update,
    deleteOne,
    getList,
    getManyReference
    // getManyReference,
} from '~/db/controllers';
import {SomeModel} from '~/db/utils';

interface CrudOptions {
    isGetListRestricted?: boolean;
    isGetManyRestricted?: boolean;
    isGetManyReferenceRestricted?: boolean;
    isGetOneRestricted?: boolean;
    isCreateRestricted?: boolean;
    isUpdateRestricted?: boolean;
    isDeleteRestricted?: boolean;
}

export function generateCRUD(
    router: Router,
    modelName: string,
    model: SomeModel,
    options: CrudOptions = {},
    verifyOwnership: (req: Request, object: unknown) => boolean = () => false
): void {
    const modelNamePrefix = modelName ? `/${modelName}` : '';

    // getList, getMany and getManyReference endpoint
    router.get(modelNamePrefix, async (req, res) => {
        if(options.isGetListRestricted) {
            return res.status(403).send();
        }

        const params = req.query;
        if (params.id) {
            if(options.isGetManyRestricted) {
                return res.status(403).send();
            }
            // getMany endpoint
            // GET http://my.api.url/modelName?id=id&id=456&id=789
            getMany(model, params).then(({status, response: {data, total}}) => {
                res.set({
                    'Access-Control-Expose-Headers': 'x-total-count',
                    'x-total-count': total,
                });

                res.status(status).json(data);
            });
        } else if(params._sort) {
        // GET http://my.api.url/modelName?author_id=345
            if(options.isGetManyReferenceRestricted) {
                return res.status(403).send();
            }
            getManyReference(model,params).then(({status, response:{total,data}}) => {
                res.set({
                    'Access-Control-Expose-Headers': 'x-total-count',
                    'x-total-count': total,
                });

                res.status(status).json(data);
            });
        } else {
        // getList endpoint
        // GET http://my.api.url/modelName?_sort=title&_order=ASC&_start=0&_end=24
            if(options.isGetListRestricted) {
                return res.status(403).send();
            }
            getList(model, params).then(({status, response: {total, data}}) => {
                res.set({
                    'Access-Control-Expose-Headers': 'x-total-count',
                    'x-total-count': total,
                });
                res.status(status).json(data);
            });
        }
    });

    // getOne endpoint
    // GET http://my.api.url/modelName/id
    router.get(`${modelNamePrefix}/:id`,async (req, res) => {
        if(options.isGetOneRestricted) {
            return res.status(403).send();
        }
        const params = req.params;
        getOne(model, params).then(({status, response: {data}}) => {
            res.status(status).json(data);
        });
    });

    // create
    // POST http://my.api.url/modelName
    router.post(modelNamePrefix, async (req, res) => {
        if(options.isCreateRestricted) {
            return res.status(403).send();
        }
        const params = req.body;
        create(model, params).then(({status, response: {data}}) => {
            res.status(status).json(data);
        });
    });
    // update
    // PUT http://my.api.url/modelName/id
    router.put(`${modelNamePrefix}/:id`,async (req, res) => {
        const {id} = req.params;
        const {response: {data}} = await getOne(model, {id});
        console.log('put');
        if(!data) {
            return res.status(404).send();
        }
        if(options.isUpdateRestricted && !verifyOwnership(req, data)) {
            return res.status(403).send();
        }
        const params = {...req.body, ...req.params};
        update(model, params).then(({status, response: {data}}) => {
            res.status(status).json(data);
        });
    });
    // delete
    // DELETE http://my.api.url/modelName/id
    router.delete(
        `${modelNamePrefix}/:id`,
        async (req, res) => {
            const {id} = req.params;
            const {response: {data}} = await getOne(model, {id});
            if(!data) {
                return res.status(404).send();
            }
            if(options.isUpdateRestricted && !verifyOwnership(req, data)) {
                return res.status(403).send();
            }
            const params = req.params;
            deleteOne(model, params).then(({status, response: {data}}) => {
                res.status(status).json(data);
            });
        }
    );
}

