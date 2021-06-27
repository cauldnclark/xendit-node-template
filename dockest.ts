import { Dockest, logLevel } from 'dockest';
import { exec } from 'child_process';
import jest from 'jest';

const { run } = new Dockest({
    composeFile: ['docker-compose.test.yml'],
    dumpErrors: true,
    jestLib: jest,
    logLevel: logLevel.DEBUG
});

const execMigration = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(
            './node_modules/.bin/ts-node -r ./src/module-alias.ts ./node_modules/typeorm/cli.js --config src/libs/typeorm/ormconfig-cli.ts migration:run',
            (error, output) => {
                if (error) {
                    return reject(error);
                }

                return resolve(output);
            }
        );
    });
};

run([
    {
        serviceName: 'postgres-test',
        readinessCheck: async ({
            defaultReadinessChecks: { postgres },
            dockerComposeFileService: {
                environment: { POSTGRES_DB, POSTGRES_USER }
            }
        }) => {
            await postgres({ POSTGRES_DB, POSTGRES_USER });
            console.log('🐙  postgres-test 🐙  ✅');
            console.log('🌈 dockest.ts 🌈  Running migrations');
            const output = await execMigration();
            console.log(output);
            console.log('🌈 dockest.ts 🌈  Migrations completed');
        }
    }
]);
