import { getConnection } from 'typeorm';
import { init } from 'src/init';

describe('init()', () => {
    afterAll(async () => {
        await getConnection().close();
    });

    it('is successful', async () => {
        const results = await init();
        expect(results).toBeObject();
    });
});
