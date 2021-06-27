import 'reflect-metadata'; // for TypeORM
import { getConnection, getCustomRepository } from 'typeorm';
import { initErrorTracking } from '@boxbag/xsh-node-error-tracking';

import { NODE_ENV, SENTRY_DSN, SERVICE_NAME } from 'src/config';
import { connect } from 'src/db-connect';
import { RootController } from 'src/controllers/root';
import { HealthcheckController } from 'src/controllers/healthcheck';
import { FeatureFlagService } from 'src/services/feature-flag';
import { FeatureFlagController } from 'src/controllers/feature-flag';
import { UserService } from 'src/services/user';
import { UserRepository } from 'src/libs/typeorm/user';
import { UsersController } from 'src/controllers/user';
import { ErrorService } from 'src/services/error-example';
import { ErrorController } from 'src/controllers/error';
import { HealthcheckService } from './services/healthcheck';

/**
 * Initialize all ENV values and dependencies here so that they are re-usable across web servers, queue runners and crons
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function init(): Promise<Record<string, any>> {
    const environment = NODE_ENV;

    initErrorTracking({
        dsn: SENTRY_DSN,
        serviceName: SERVICE_NAME,
        environment
    });

    // repositories
    await connect();
    const userRepo = getCustomRepository(UserRepository);

    // services
    const userService = new UserService(userRepo);
    const errorService = new ErrorService();
    const featureFlagService = new FeatureFlagService();
    const healthcheckService = new HealthcheckService(getConnection());

    // controllers
    const rootController = new RootController();
    const userController = new UsersController(userService);
    const errorController = new ErrorController(errorService);
    const featureFlagController = new FeatureFlagController(featureFlagService);
    const healthcheckController = new HealthcheckController(healthcheckService);

    return {
        userRepo,

        userService,
        errorService,
        featureFlagService,

        rootController,
        userController,
        errorController,
        featureFlagController,
        healthcheckController
    };
}
