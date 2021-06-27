import 'reflect-metadata';
import { Response, Request, NextFunction } from 'express';

import { User } from 'src/domain/user';
import { UserService } from 'src/services/user';
import { UsersController } from 'src/controllers/user';
import { StandardError } from 'src/domain/standard-error';

jest.mock('src/services/user');
const MockedUserService = UserService as jest.Mocked<typeof UserService>;
const mockedUserServiceInstance = new MockedUserService(null);

describe('UsersController', () => {
    const res = { status: undefined, json: undefined } as unknown as Response;
    let next: NextFunction;

    beforeEach(() => {
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        next = jest.fn();
    });

    describe('GET /api/users', () => {
        it('should return 200 OK', async () => {
            mockedUserServiceInstance.findAll = jest.fn().mockReturnValueOnce([]);

            const controller = new UsersController(mockedUserServiceInstance);
            await controller.get({} as Request, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should throw error when unexpected error occurs', async () => {
            const err = new StandardError('UNKNOWN', '');
            mockedUserServiceInstance.findAll = jest.fn().mockRejectedValueOnce(err);

            const controller = new UsersController(mockedUserServiceInstance);
            await controller.get({} as Request, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return 200 OK on success', async () => {
            const mockUser = new User();
            mockedUserServiceInstance.findOne = jest.fn().mockReturnValueOnce(mockUser);

            const controller = new UsersController(mockedUserServiceInstance);
            await controller.getById({ params: { id: '123' } } as unknown as Request, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should throw error when unexpected error occurs', async () => {
            const err = new StandardError('UNKNOWN', '');
            mockedUserServiceInstance.findOne = jest.fn().mockRejectedValueOnce(err);

            const controller = new UsersController(mockedUserServiceInstance);
            await controller.getById({ params: { id: '123' } } as unknown as Request, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
