import { PlayerCoupon } from '../../src/entities/PlayerCoupon';
import { Coupon } from '../../src/entities/Coupon';
import { Reward } from '../../src/entities/Reward';
import { Player } from '../../src/entities/Player';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { ConfigService } from '@nestjs/config';

export default function (configService: ConfigService) {
  return {
    type: 'mysql',
    host: configService.get('TYPEORM_HOST'),
    port: configService.get('TYPEORM_PORT'),
    username: configService.get('TYPEORM_USERNAME'),
    password: configService.get('TYPEORM_PASSWORD'),
    database: configService.get('TYPEORM_TEST_DATABASE'),
    entities: [Player, Reward, Coupon, PlayerCoupon],
    synchronize: true,
    migrationsRun: true,
  } as MysqlConnectionOptions;
}
