import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { Player } from '../entities/Player';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('PlayerService', () => {
  let service: PlayerService;
  let repository: Repository<Player>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: getRepositoryToken(Player),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
    repository = module.get<Repository<Player>>(getRepositoryToken(Player));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find an entity by ID', async () => {
    const player = new Player();
    player.id = 1;
    player.name = 'player1';
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(player);

    const result = await service.findOneBy({ id: 1 });

    expect(result).toBe(player);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should return undefined if the entity is not found', async () => {
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);
    const result = await service.findOneBy({ id: 1 });
    expect(result).toBeUndefined();
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });
});
