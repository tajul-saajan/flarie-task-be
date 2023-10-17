import { Seeder } from 'nestjs-seeder';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from '../../entities/Reward';
import * as moment from 'moment';
@Injectable()
export class RewardSeeder implements Seeder {
  private moment: moment.Moment;
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
  ) {
    this.moment = moment();
  }

  async seed() {
    const rewardsToCreate: Partial<Reward>[] = [
      {
        name: 'Valid Reward',
        startDate: this.moment.subtract(2, 'days').toDate(),
        endDate: this.moment.add(3, 'days').toDate(),
        perDayLimit: 2,
        totalLimit: 5,
      },
      {
        name: 'InValid Reward as date is expired',
        startDate: this.moment.subtract(5, 'days').toDate(),
        endDate: this.moment.subtract(3, 'days').toDate(),
        perDayLimit: 2,
        totalLimit: 5,
      },
      {
        name: 'InValid Reward as it exceeds total limit',
        startDate: this.moment.subtract(5, 'days').toDate(),
        endDate: this.moment.subtract(3, 'days').toDate(),
        perDayLimit: 2,
        totalLimit: 0,
      },
    ];

    await this.rewardRepository.save(rewardsToCreate);
  }

  async drop() {
    return await this.rewardRepository.delete({});
  }
}
