import { seeder } from 'nestjs-seeder';
import { PlayerSeeder } from './player.seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from '../../typeorm';
import { Player } from '../../entities/Player';
import { Reward } from '../../entities/Reward';
import { RewardSeeder } from './reward.seeder';

seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    TypeOrmModule.forFeature([Player, Reward]),
  ],
}).run([PlayerSeeder, RewardSeeder]);
