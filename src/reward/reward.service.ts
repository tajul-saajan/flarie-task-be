import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reward } from '../entities/Reward';
import { Repository } from 'typeorm';
import { CouponRedeemDto } from './dtos/coupon-redeem.dto';
import * as moment from 'moment';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { PlayerService } from '../player/player.service';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    private readonly playerService: PlayerService,
    @InjectRepository(PlayerCoupon)
    private readonly playerCouponRepository: Repository<PlayerCoupon>,
    private readonly couponService: CouponService,
  ) {}

  async redeemCoupon(dto: CouponRedeemDto) {
    const { playerId, rewardId } = dto;

    const reward = await this.findOneBy({ id: rewardId });
    const player = await this.playerService.findOneBy({ id: playerId });

    if (!this.isValid(reward))
      throw new HttpException(
        'Coupon is not valid anymore',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const query = this.playerCouponRepository
      .createQueryBuilder('player_coupon')
      .innerJoinAndSelect(
        'player_coupon.coupon',
        'coupon',
        'coupon.rewardId = :rewardId',
        {
          rewardId,
        },
      );

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

    const availedCoupons = await query.clone().loadAllRelationIds().getMany();

    const ids = availedCoupons.map((c) => c.coupon);

    const firstUnRedeemed = await this.couponService.getFirstUnRedeemed(
      ids as unknown as number[],
    );

    if (!firstUnRedeemed)
      throw new HttpException('no coupon left to redeem', HttpStatus.NOT_FOUND);

    await this.playerCouponRepository.save({
      coupon: firstUnRedeemed,
      player: player,
      redeemedAt: moment().toDate(),
    });

    return firstUnRedeemed;
  }

  async findAllRewards() {
    return await this.rewardRepository.find();
  }

  async findAllPlayerCoupons() {
    return await this.playerCouponRepository.find();
  }

  isValid({ startDate, endDate }: Reward): boolean {
    const today = moment();
    return today.isBetween(startDate, endDate);
  }

  async findOneBy(reward: Partial<Reward>) {
    return await this.rewardRepository.findOneBy({ ...reward });
  }
}
