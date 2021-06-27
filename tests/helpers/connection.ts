import { createConnection, Connection } from 'typeorm';
import { OrmConfig } from 'src/libs/typeorm/ormconfig';

export const createTestConnection = async (): Promise<Connection> => {
    return createConnection(OrmConfig);
};
