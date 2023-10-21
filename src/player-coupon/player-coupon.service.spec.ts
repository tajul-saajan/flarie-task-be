import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerCouponService } from './player-coupon.service';
import { Reward } from '../entities/Reward';
import * as moment from 'moment/moment';
import { PlayerCoupon } from '../entities/PlayerCoupon';

describe('PlayerCouponService', () => {
  let playerCouponService: PlayerCouponService;

  // Mock HttpException
  const mockHttpException = jest.fn(
    () => new HttpException('', HttpStatus.PRECONDITION_FAILED),
  );

  // Mock the PlayerCoupon repository
  const mockRepository = {
    createQueryBuilder: jest.fn(() => ({
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      loadAllRelationIds: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
      getMany: jest.fn(),
    })),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerCouponService],
    })
      .overrideProvider(PlayerCouponService)
      .useValue({
        repository: mockRepository,
        HttpException: mockHttpException,
        getRedeemedCoupons: jest.fn(),
        create: jest.fn(),
      })
      .compile();

    playerCouponService = module.get<PlayerCouponService>(PlayerCouponService);
  });

  describe('getRedeemedCoupons', () => {
    it('should return redeemed coupons when limits are not reached', async () => {
      const reward: Reward = {
        name: 'wc2023',
        id: 1,
        totalLimit: 10,
        perDayLimit: 5,
        startDate: moment().subtract(2, 'days').toDate(),
        endDate: moment().add(2, 'days').toDate(),
      };
      const expectedCouponData = [{ id: 1 }, { id: 2 }];

      // Set getCount behavior to simulate no coupons redeemed yet
      mockRepository.createQueryBuilder().getCount.mockResolvedValue(0);

      // Mock getMany to return expected coupon data
      mockRepository
        .createQueryBuilder()
        .getMany.mockResolvedValue(expectedCouponData);

      const result = await playerCouponService.getRedeemedCoupons(reward);

      expect(result).toEqual(expectedCouponData);
    });

    it('should throw a precondition failed error when total limit is reached', async () => {
      const reward: Reward = {
        name: 'wc2023',
        id: 1,
        totalLimit: 2,
        perDayLimit: 5,
        startDate: moment().subtract(2, 'days').toDate(),
        endDate: moment().add(2, 'days').toDate(),
      };

      // Set getCount behavior to simulate total limit reached
      mockRepository.createQueryBuilder().getCount.mockResolvedValue(2);

      // Ensure that the HttpException is thrown
      await expect(
        playerCouponService.getRedeemedCoupons(reward),
      ).rejects.toThrow(HttpException);
    });

    it('should throw a precondition failed error when daily limit is reached', async () => {
      // Mock your reward
      const reward: Reward = {
        name: 'wc2023',
        id: 1,
        totalLimit: 10,
        perDayLimit: 2,
        startDate: moment().subtract(2, 'days').toDate(),
        endDate: moment().add(2, 'days').toDate(),
      };

      // Set getCount behavior to simulate daily limit reached
      mockRepository.createQueryBuilder().getCount.mockResolvedValue(2);

      // Ensure that the HttpException is thrown
      await expect(
        playerCouponService.getRedeemedCoupons(reward),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should create a new player coupon', async () => {
      const playerCouponData: PlayerCoupon = {
        id: 1,
      } as unknown as PlayerCoupon;

      // Call the create method
      await playerCouponService.create(playerCouponData);

      // Expect that the repository's save method was called with the expected data
      expect(mockRepository.save).toHaveBeenCalledWith(playerCouponData);
    });
  });
});
