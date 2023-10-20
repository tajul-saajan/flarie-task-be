import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/Player';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player) private readonly repository: Repository<Player>,
  ) {}

  async findOneBy(player: Partial<Player>) {
    return await this.repository.findOneBy({ ...player });
  }
}
