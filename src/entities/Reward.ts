import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
@Entity()
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  perDayLimit: number;

  @Column()
  totalLimit: number;

  isValid(): boolean {
    const { startDate, endDate } = this;
    const today = moment();
    return today.isBetween(startDate, endDate);
  }
}
