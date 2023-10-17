import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reward } from '../entities/Reward';
import { Repository } from 'typeorm';
import { CouponRedeemDto } from './dtos/coupon-redeem.dto';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward) private readonly repository: Repository<Reward>,
  ) {}

  async redeemCoupon(dto: CouponRedeemDto) {
    return dto;
  }
}
