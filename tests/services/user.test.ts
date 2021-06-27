import 'reflect-metadata';

import { User } from 'src/domain/user';
import { UserService } from 'src/services/user';
import { UserRepository } from 'src/libs/typeorm/user';

jest.mock('src/libs/typeorm/user');

describe('UserService', () => {
    const MockedUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
    const mockedUserRepositoryInstance = new MockedUserRepository();

    describe('findAll()', () => {
        it('returns successful response', async () => {
            const expectedResults: User[] = [];
            mockedUserRepositoryInstance.find = jest.fn().mockReturnValueOnce(expectedResults);

            const service = new UserService(mockedUserRepositoryInstance);
            const results = await service.findAll();

            expect(results).toEqual(expectedResults);
        });
    });
});
