import { PlayerCoupon } from '../../src/entities/PlayerCoupon';
import { Coupon } from '../../src/entities/Coupon';
import { Reward } from '../../src/entities/Reward';
import { Player } from '../../src/entities/Player';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export default {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'aaaaaa',
  database: 'e2e',
  entities: [Player, Reward, Coupon, PlayerCoupon],
  synchronize: true,
  migrationsRun: true,
} as MysqlConnectionOptions;
