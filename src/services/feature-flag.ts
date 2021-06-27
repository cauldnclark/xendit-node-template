import LaunchDarkly, { LDClient, LDFlagValue } from 'launchdarkly-node-server-sdk';
import { LAUNCH_DARKLY_SDK_KEY, IS_TEST } from 'src/config';
import { logger } from 'src/libs/logger';

export const LAUNCH_DARKLY_GLOBAL_USER = 'GLOBAL';
export const FEATURE_FLAGS = {
    TEST_FEATURE_FLAG: 'test-feature-flag'
};

export class FeatureFlagService {
    launchDarklyClient: LDClient;

    constructor() {
        const apiKey: string = LAUNCH_DARKLY_SDK_KEY;
        const offline = IS_TEST;
        this.launchDarklyClient = LaunchDarkly.init(apiKey, { logger, offline });
    }

    private async waitForInitialization() {
        if (!this.launchDarklyClient.initialized) {
            try {
                logger.info('Initialization of LaunchDarkly client starting...');
                await this.launchDarklyClient.waitForInitialization();
                logger.info('Initialization of LaunchDarkly client succeeded...');
            } catch (err) {
                logger.error(err, 'Initialization of LaunchDarkly client failed.');
            }
        }
    }

    async getBooleanFlag(flagName: string): Promise<LDFlagValue> {
        await this.waitForInitialization();
        return this.launchDarklyClient.variation(
            flagName || FEATURE_FLAGS.TEST_FEATURE_FLAG,
            { key: LAUNCH_DARKLY_GLOBAL_USER },
            false
        );
    }
}
