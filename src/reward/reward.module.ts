import { Module } from '@nestjs/common';

import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from '../entities/Reward';
import { Player } from '../entities/Player';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { Coupon } from '../entities/Coupon';
import { PlayerService } from '../player/player.service';
import { CouponService } from '../coupon/coupon.service';

@Module({
  imports: [
    RewardModule,
    TypeOrmModule.forFeature([Reward, Player, PlayerCoupon, Coupon]),
  ],
  controllers: [RewardController],
  providers: [RewardService, PlayerService, CouponService],
})
export class RewardModule {}
