import { Seeder } from 'nestjs-seeder';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../../entities/Player';

@Injectable()
export class PlayerSeeder implements Seeder {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async seed() {
    const playersToCreate = [
      { name: 'Player 1' },
      { name: 'Player 2' },
      { name: 'Player 3' },
    ];

    await this.playerRepository.save(playersToCreate);
  }

  async drop() {
    return await this.playerRepository.delete({});
  }
}
