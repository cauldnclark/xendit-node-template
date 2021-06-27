import express, { Application } from 'express';
import httpContext from 'express-http-context';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';

import { OpenApiValidator } from '@boxbag/xsh-node-openapi-validator';
import { createMiddleware } from '@boxbag/xsh-node-logger';

import { PORT } from 'src/config';
import { logger } from 'src/libs/logger';
import { errorHandler } from 'src/controllers/middlewares/handle-error-code';

import { init } from 'src/init';

/**
 * Setup the application routes with controllers
 * @param app
 */
async function setupRoutes(app: Application) {
    const { rootController, userController, errorController, featureFlagController, healthcheckController } =
        await init();

    app.use('/api/users', userController.getRouter());
    app.use('/api/feature-flag', featureFlagController.getRouter());
    app.use('/healthcheck', healthcheckController.getRouter());
    app.use('/errors', errorController.getRouter());
    app.use('/', rootController.getRouter());
}

/**
 * Main function to setup Express application here
 */
export async function createApp(): Promise<express.Application> {
    const app = express();
    app.set('port', PORT);
    app.use(helmet());
    app.use(compression());
    app.use(bodyParser.json({ limit: '5mb', type: 'application/json' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(createMiddleware(logger)); // Needs to be after bodyParser

    const openApiValidator = new OpenApiValidator();
    await openApiValidator.install(app);

    // This should be last, right before routes are installed
    // so we can have access to context of all previously installed
    // middlewares inside our routes to be logged
    app.use(httpContext.middleware);

    await setupRoutes(app);

    // In order for errors from async controller methods to be thrown here,
    // you need to catch the errors in the controller and use `next(err)`.
    // See https://expressjs.com/en/guide/error-handling.html
    app.use(errorHandler());

    return app;
}
