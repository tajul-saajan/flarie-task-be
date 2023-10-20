import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import typeorm from './typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RewardModule } from './reward/reward.module';
import { APP_PIPE } from '@nestjs/core';
import { AppService } from './app.service';
import { Exists } from './validators/exists.validator';

@Module({
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
    RewardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Exists,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
