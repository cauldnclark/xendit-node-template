import '../module-alias';

// This needs to be imported before everything else.
// eslint-disable-next-line import/order
import 'src/libs/tracer';
import { logger } from 'src/libs/logger';
import { sleep } from 'src/libs/sleep';

const doWork = async () => {
    logger.info(`Current time is ${Date.now()}`);
    await sleep(1000);
};

(async () => {
    // Worker runner
    // eslint-disable-next-line
    while (true) {
        try {
            await doWork(); // eslint-disable-line
        } catch (err) {
            logger.error(err, 'error in worker');
        } finally {
            logger.info('done');
        }
    }
})();
