import path from 'path';
import express, {RequestHandler} from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import morgan from 'morgan';
import {createRequestHandler} from '@remix-run/express';

import {createAdminCRUD, createModelCRUD} from './adminScaffolding';
import {authAdminRequiredFilter, authRequiredFilter, connectAuth} from './auth';

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), 'server/build');

const app = express();
app.use(compression());
app.use(bodyParser.json());

app.use('/image-compressed', express.static('public/image-compressed', {maxAge: '1h'}));
// You may want to be more aggressive with this caching
app.use(express.static('public', {maxAge: '1h'}));

// Remix fingerprints its assets so we can cache forever
app.use(express.static('public/build', {immutable: true, maxAge: '1y'}));

app.use(morgan('tiny'));

const purgeRequestHandler: RequestHandler = (req, res, next) => {
    purgeRequireCache();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const build = require('../build');
    return createRequestHandler({build, mode: MODE})(req, res, next);
};

app.all(
    '*',
    MODE === 'production'
        ? createRequestHandler({build: require('./build')})
        : purgeRequestHandler
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});

////////////////////////////////////////////////////////////////////////////////
function purgeRequireCache() {
    // purge require cache on requests for "server side HMR" this won't let
    // you have in-memory objects between requests in development,
    // alternatively you can set up nodemon/pm2-dev to restart the server on
    // file changes, we prefer the DX of this though, so we've included it
    // for you by default
    for (const key in require.cache) {
        if (key.startsWith(BUILD_DIR)) {
            delete require.cache[key];
        }
    }
}
