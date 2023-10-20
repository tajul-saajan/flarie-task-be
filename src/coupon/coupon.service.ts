import { Injectable } from '@nestjs/common';
import { In, Not, Repository } from 'typeorm';
import { Coupon } from '../entities/Coupon';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon) private readonly repository: Repository<Coupon>,
  ) {}

  async getFirstUnRedeemed(redeemedIds: number[] | null) {
    if (!redeemedIds) redeemedIds = [];
    return await this.repository.findOne({
      where: { id: Not(In(redeemedIds)) },
    });
  }
}
