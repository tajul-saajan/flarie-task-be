import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { Repository } from 'typeorm';
import { Reward } from '../entities/Reward';

@Injectable()
export class PlayerCouponService {
  constructor(
    @InjectRepository(PlayerCoupon)
    private readonly repository: Repository<PlayerCoupon>,
  ) {}

  async getRedeemedCoupons(reward: Reward) {
    const query = this.repository
      .createQueryBuilder('player_coupon')
      .innerJoinAndSelect('player_coupon.coupon', 'c')
      .loadAllRelationIds()
      .where('c.Reward = :rewardId', {
        rewardId: reward.id,
      });

    const allRedeemedCouponCount = await query.clone().getCount();
    if (allRedeemedCouponCount >= reward.totalLimit)
      throw new HttpException(
        'total limit already has been reached',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    const todayRedeemedCouponCount = await query
      .clone()
      .where(`DATE(player_coupon.redeemedAt) = CURRENT_DATE`)
      .getCount();

    if (todayRedeemedCouponCount >= reward.perDayLimit)
      throw new HttpException(
        'daily limit already has been reached',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return await query.clone().loadAllRelationIds().getMany();
  }

  async create(pc: Omit<PlayerCoupon, 'id'>) {
    return this.repository.save(pc);
  }
}
