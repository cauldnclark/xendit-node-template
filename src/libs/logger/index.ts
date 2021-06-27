import { createLogger } from '@boxbag/xsh-node-logger';
import { IS_LOCAL, IS_TEST } from 'src/config';

export const logger = createLogger({
    options: { prettyPrint: IS_LOCAL, level: IS_TEST ? 'silent' : 'info' }
});
