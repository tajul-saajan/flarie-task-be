import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { EntityManager, Repository } from 'typeorm';
import { Reward } from '../entities/Reward';
import { response } from 'express';
import { Coupon } from '../entities/Coupon';

@Injectable()
export class PlayerCouponService {
  constructor(
    @InjectRepository(PlayerCoupon)
    private readonly repository: Repository<PlayerCoupon>,
    private readonly entityManager: EntityManager,
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

  async findAll(r: Reward) {
    // return await this.entityManager
    //   .createQueryBuilder(Reward, 'reward')
    //   .where('reward.id=:id', { id: r.id })
    //   .loadAllRelationIds()
    //   .getMany();
    // return this.entityManager
    //   .createQueryBuilder(Coupon, 'coupon')
    //   .loadAllRelationIds()
    //   .innerJoin('coupon.Reward', 'reward')
    //   .where('reward.id = :rewardId', { rewardId: r.id })
    //   .getMany();

    return await this.repository
      .createQueryBuilder('player_coupon')
      .innerJoinAndSelect('player_coupon.coupon', 'c')
      .loadAllRelationIds()
      .where('c.Reward = :rewardId', {
        rewardId: r.id,
      })
      .getMany();
  }
}
