import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from '../src/entities/Reward';
import * as moment from 'moment';
import { RewardService } from '../src/reward/reward.service';
import { Coupon } from '../src/entities/Coupon';
import { PlayerCoupon } from '../src/entities/PlayerCoupon';
import { Player } from '../src/entities/Player';
import { HttpException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: RewardService;
  let rewardRepository: Repository<Reward>;
  let playerRepository: Repository<Player>;
  let couponRepository: Repository<Coupon>;
  let playerCouponRepository: Repository<PlayerCoupon>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        RewardService,
        {
          provide: getRepositoryToken(Reward),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Player),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlayerCoupon),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Coupon),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
    rewardRepository = module.get<Repository<Reward>>(
      getRepositoryToken(Reward),
    );
    playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
    couponRepository = module.get<Repository<Coupon>>(
      getRepositoryToken(Coupon),
    );
    playerCouponRepository = module.get<Repository<PlayerCoupon>>(
      getRepositoryToken(PlayerCoupon),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('test', () => {
    it('it should return 4 reward items', async () => {
      jest.spyOn(rewardRepository, 'find').mockResolvedValueOnce(REWARDS);
      const result = await service.findAllRewards();
      expect(result.length).toEqual(4);
    });

    it('it should return 3 player items', async () => {
      jest.spyOn(playerRepository, 'find').mockResolvedValueOnce(PLAYERS);
      const result = await service.findAllPlayers();
      expect(result.length).toEqual(3);
    });

    it('it should return 3 coupons items', async () => {
      jest
        .spyOn(couponRepository, 'find')
        .mockResolvedValueOnce(COUPONS as unknown as Coupon[]);
      const result = await service.findAllCoupons();
      expect(result.length).toEqual(3);
    });

    it('it should return 3 coupons items', async () => {
      jest
        .spyOn(playerCouponRepository, 'find')
        .mockResolvedValueOnce(PLAYER_COUPONS as unknown as PlayerCoupon[]);
      const result = await service.findAllPlayerCoupons();
      expect(result.length).toEqual(1);
    });

    it('should return Http Exception', async () => {
      const val = await service.redeemCoupon({
        playerId: 25,
        rewardId: 5,
      });

      expect(val).toThrow(HttpException);
    });
  });
});

const REWARDS: Reward[] = [
  {
    id: 1,
    name: 'Valid Reward',
    startDate: moment().subtract(2, 'days').startOf('day').toDate(),
    endDate: moment().add(3, 'days').endOf('day').toDate(),
    perDayLimit: 2,
    totalLimit: 5,
  },
  {
    id: 2,
    name: 'InValid Reward as date is expired',
    startDate: moment().subtract(5, 'days').startOf('day').toDate(),
    endDate: moment().subtract(3, 'days').endOf('day').toDate(),
    perDayLimit: 2,
    totalLimit: 5,
  },
  {
    id: 3,
    name: 'InValid Reward as it exceeds total limit',
    startDate: moment().subtract(5, 'days').startOf('day').toDate(),
    endDate: moment().subtract(3, 'days').endOf('day').toDate(),
    perDayLimit: 2,
    totalLimit: 0,
  },
  {
    id: 4,
    name: 'InValid Reward as it exceeds total limit',
    startDate: moment().subtract(5, 'days').startOf('day').toDate(),
    endDate: moment().subtract(3, 'days').endOf('day').toDate(),
    perDayLimit: 2,
    totalLimit: 0,
  },
];

const PLAYERS: Player[] = [
  { id: 1, name: 'Player 1' },
  { id: 2, name: 'Player 2' },
  { id: 3, name: 'Player 3' },
];

const COUPONS = [
  { id: 1, value: 'MR15', rewardId: 1 },
  { id: 2, value: 'SAKIB75', rewardId: 1 },
  { id: 3, value: 'TAMIM28', rewardId: 1 },
];

const PLAYER_COUPONS = [
  { id: 1, playerId: 1, couponId: 1, redeemedAt: moment().toDate() },
];
