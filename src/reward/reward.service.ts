import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reward } from '../entities/Reward';
import { Repository } from 'typeorm';
import { CouponRedeemDto } from './dtos/coupon-redeem.dto';
import * as moment from 'moment';
import { PlayerService } from '../player/player.service';
import { CouponService } from '../coupon/coupon.service';
import { PlayerCouponService } from '../player-coupon/player-coupon.service';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    private readonly playerService: PlayerService,
    private readonly playerCouponService: PlayerCouponService,
    private readonly couponService: CouponService,
  ) {}

  async redeemCoupon(dto: CouponRedeemDto) {
    const { playerId, rewardId } = dto;

    const reward = await this.rewardRepository.findOneBy({ id: rewardId });
    const player = await this.playerService.findOneBy({ id: playerId });

    if (!this.isValid(reward))
      throw new HttpException(
        'Coupon is not valid anymore',
        HttpStatus.PRECONDITION_FAILED,
      );

    const availedCoupons =
      await this.playerCouponService.getRedeemedCoupons(reward);

    const ids = availedCoupons.map((c) => c.coupon);

    const firstUnRedeemed = await this.couponService.getFirstUnRedeemed(
      rewardId,
      ids as unknown as number[],
    );

    if (!firstUnRedeemed)
      throw new HttpException('no coupon left to redeem', HttpStatus.NOT_FOUND);

    await this.playerCouponService.create({
      coupon: firstUnRedeemed,
      player: player,
      redeemedAt: moment().toDate(),
    });

    return firstUnRedeemed;
  }

  isValid({ startDate, endDate }: Reward): boolean {
    const today = moment();
    return today.isBetween(startDate, endDate);
  }
}
