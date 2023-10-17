import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { RewardService } from './reward.service';
import { CouponRedeemDto } from './dtos/coupon-redeem.dto';
import { Response } from 'express';

@Controller('reward')
export class RewardController {
  constructor(private readonly service: RewardService) {}
  @Get()
  dummy() {
    return 'it works';
  }

  @Post('coupon-redeem')
  async redeem(@Body() dto: CouponRedeemDto) {
    return await this.service.redeemCoupon(dto);
  }
}
