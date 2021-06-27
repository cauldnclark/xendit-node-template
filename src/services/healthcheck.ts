import { Connection } from 'typeorm';

export class HealthcheckService {
    db: Connection;

    constructor(db: Connection) {
        this.db = db;
    }

    async isDBReady(): Promise<boolean> {
        if (!this.db.isConnected) {
            return false;
        }

        const hasPendingMigrations = await this.db.showMigrations();
        return !hasPendingMigrations;
    }
}
