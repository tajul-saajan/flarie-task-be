import { Module } from '@nestjs/common';

import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from '../entities/Reward';

@Module({
  imports: [RewardModule, TypeOrmModule.forFeature([Reward])],
  controllers: [RewardController],
  providers: [RewardService],
})
export class RewardModule {}
