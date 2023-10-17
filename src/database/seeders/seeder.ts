import { seeder } from 'nestjs-seeder';
import { PlayerSeeder } from './player.seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from '../../typeorm';
import { Player } from '../../entities/Player';

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
    TypeOrmModule.forFeature([Player]),
  ],
}).run([PlayerSeeder]);
