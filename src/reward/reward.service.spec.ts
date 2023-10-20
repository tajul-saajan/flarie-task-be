import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardService } from './reward.service';
import { Reward } from '../entities/Reward';
import { PlayerService } from '../player/player.service';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { Coupon } from '../entities/Coupon';
import { Player } from '../entities/Player';
import { CouponService } from '../coupon/coupon.service';

describe('RewardService', () => {
  let service: RewardService;
  let playerService: PlayerService;
  let repository: Repository<Reward>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: getRepositoryToken(Reward),
          useClass: Repository,
        },
        PlayerService,
        {
          provide: getRepositoryToken(Player),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlayerCoupon),
          useClass: Repository,
        },
        CouponService,
        {
          provide: getRepositoryToken(Coupon),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
    playerService = module.get<PlayerService>(PlayerService);
    repository = module.get<Repository<Reward>>(getRepositoryToken(Reward));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find an entity by ID', async () => {
    const reward = new Reward();
    reward.id = 1;
    reward.name = 'player1';
    reward.totalLimit = 5;
    reward.perDayLimit = 3;
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(reward);

    const result = await service.findOneBy({ id: 1 });

    expect(result).toBe(reward);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should return undefined if the entity is not found', async () => {
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);
    const result = await service.findOneBy({ id: 1 });
    expect(result).toBeUndefined();
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });
});
