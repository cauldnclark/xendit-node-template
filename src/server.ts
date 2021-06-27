import 'source-map-support/register';
import './module-alias';

// This needs to be imported before everything else.
// eslint-disable-next-line import/order
import 'src/libs/tracer';

import P from 'bluebird';
import http from 'http';
import { NODE_KEEP_ALIVE_TIMEMOUT_MS } from 'src/config';
import { logger } from 'src/libs/logger';
import { createApp } from 'src/app';

const SERVER_SHUTDOWN_TIMEOUT_MS = 10_000;
const HEADERS_TIMEOUT_MS = NODE_KEEP_ALIVE_TIMEMOUT_MS + 1000;

/**
 * Helper function to log an exit code before exiting the process.
 */
const logAndExitProcess = (exitCode: number) => {
    logger.info(
        {
            exit_code_number: exitCode
        },
        'Exiting process'
    );
    process.exit(exitCode);
};

/**
 * Returns a promise that attempts to shut an http server down,
 * resolving if it succeeded and rejecting if it failed or timed out.
 */
const shutdownServerWithTimeout = async (server: http.Server): Promise<unknown> =>
    Promise.race([
        P.fromCallback((cb) => server.close(cb)),
        new Promise((resolve, reject) =>
            setTimeout(() => reject(Error('Timeout shutting server')), SERVER_SHUTDOWN_TIMEOUT_MS)
        )
    ]);

/**
 * Helper function to setup signal handlers on the process to gracefully
 * shutdown the server.
 */
const setupSignalHandlers = (server: http.Server) => {
    process.on('SIGTERM', async () => {
        logger.info('Received signal: SIGTERM');
        try {
            await shutdownServerWithTimeout(server);
            logAndExitProcess(0);
        } catch (err) {
            logger.error(err, 'Failed to shutdown server');
            logAndExitProcess(1);
        }
    });
    process.on('SIGINT', async () => {
        logger.info('Received signal: SIGINT');
        try {
            await shutdownServerWithTimeout(server);
            logAndExitProcess(0);
        } catch (err) {
            logger.error(err, 'Failed to shutdown server');
            logAndExitProcess(1);
        }
    });
};

/**
 * Sets up event listeners on unexpected errors and warnings. These should theoretically
 * never happen. If they do, we assume that the app is in a bad state. For errors, we
 * exit the process with code 1.
 */
const setupProcessEventListeners = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process.on('unhandledRejection', (reason: any) => {
        logger.warn({ reason_object: reason }, 'encountered unhandled rejection');
        logAndExitProcess(1);
    });

    process.on('uncaughtException', (err: Error) => {
        logger.error(err, 'encountered uncaught exception');
        logAndExitProcess(1);
    });

    process.on('warning', (warning: Error) => {
        logger.warn(
            {
                warning_object: warning
            },
            'encountered warning'
        );
    });
};

/**
 * Start an Express server and installs signal handlers on the
 * process for graceful shutdown.
 */
(async () => {
    try {
        const app = await createApp();
        const server = app.listen(app.get('port'), () => {
            logger.info(
                {
                    port_number: app.get('port'),
                    env_string: app.get('env')
                },
                'Started express server'
            );
        });
        setupSignalHandlers(server);
        setupProcessEventListeners();

        /**
         * Configure the timeout of idle connections to match settings on ELB
         * Setting this lower than the idle timeout on AWS ELB might cause the ELB
         * to re-use a closed connection, causing a 502 (connection reset by peer)
         */
        server.keepAliveTimeout = NODE_KEEP_ALIVE_TIMEMOUT_MS;
        server.headersTimeout = HEADERS_TIMEOUT_MS;
    } catch (err) {
        logger.error(err, 'error caught in server.ts');
    }
})();
