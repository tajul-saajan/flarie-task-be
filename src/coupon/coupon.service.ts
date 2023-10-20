import { Injectable } from '@nestjs/common';
import { In, Not, Repository } from 'typeorm';
import { Coupon } from '../entities/Coupon';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon) private readonly repository: Repository<Coupon>,
  ) {}

  async getFirstUnRedeemed(rewardId: number, redeemedIds: number[] | null) {
    if (!redeemedIds) redeemedIds = [];
    return this.repository
      .createQueryBuilder('coupon')
      .loadAllRelationIds()
      .where('coupon.Reward=:id', { id: rewardId })
      .andWhere({ id: Not(In(redeemedIds)) })
      .select(['coupon.id', 'coupon.value'])
      .getOne();
  }
}
