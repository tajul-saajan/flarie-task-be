import { Test, TestingModule } from '@nestjs/testing';
import { PlayerCouponService } from './player-coupon.service';

describe('PlayerCouponService', () => {
  let service: PlayerCouponService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerCouponService],
    }).compile();

    service = module.get<PlayerCouponService>(PlayerCouponService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
