import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createDatabase, dropDatabase } from 'typeorm-extension';
import testDbConfig from './test-utis/test-db.config';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { Reward } from '../src/entities/Reward';
import { Player } from '../src/entities/Player';
import { Coupon } from '../src/entities/Coupon';
import rewards from './test-utis/rewards';
import players from './test-utis/players';
import coupons from './test-utis/coupons';

export class TestDBInitiator {
  private readonly initialDatabase: string;
  private readonly testDatabase = 'e2e';
  readonly dbOptions: MysqlConnectionOptions;
  readonly configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
    const config = testDbConfig(this.configService);

    this.initialDatabase = config.database;
    this.dbOptions = {
      ...config,
    };
  }

  async createDatabase() {
    await this.dropDatabase();
    console.log(`Creating test database '${this.dbOptions.database}'`);
    await createDatabase({
      options: this.dbOptions,
      initialDatabase: this.initialDatabase,
      ifNotExist: false,
    });
    const dataSource = await createTestDataSource(this.dbOptions);

    console.log('Running migrations');
    await dataSource.runMigrations({ transaction: 'all' });
    await dataSource.destroy();

    console.log('✓ Done. Test database is ready to accept connections ✓\n');
  }

  async dropDatabase(dropAll = false) {
    console.log(`Dropping test database '${this.testDatabase}'`);
    if (dropAll) {
      await createTestDataSource(this.dbOptions);
    }
    await dropDatabase({
      options: this.dbOptions,
      initialDatabase: this.initialDatabase,
    });
  }
}

export async function createTestDataSource(dbOptions: MysqlConnectionOptions) {
  const dataSource = new DataSource(dbOptions);
  await dataSource.initialize();
  await dataSource.synchronize();
  await dataSource.runMigrations();

  const rewardRepository = dataSource.getRepository(Reward);
  const playerRepository = dataSource.getRepository(Player);
  const couponRepository = dataSource.getRepository(Coupon);
  //
  for (const r of rewards) {
    await rewardRepository.save(r);
  }
  for (const p of players) {
    await playerRepository.save(p);
  }
  for (const c of coupons) {
    await couponRepository.save(c);
  }
  return dataSource;
}
