import * as moment from 'moment';

export default [
  {
    name: 'Valid Reward',
    startDate: moment().clone().subtract(2, 'days').startOf('day').toDate(),
    endDate: moment().clone().add(3, 'days').endOf('day').toDate(),
    perDayLimit: 2,
    totalLimit: 5,
  },
  {
    name: 'InValid Reward as date is expired',
    startDate: moment().clone().subtract(5, 'days').startOf('day').toDate(),
    endDate: moment().clone().subtract(3, 'days').endOf('day').toDate(),
    perDayLimit: 2,
    totalLimit: 5,
  },
  {
    name: 'InValid Reward as it exceeds total limit',
    startDate: moment().clone().subtract(2, 'days').startOf('day').toDate(),
    endDate: moment().clone().add(3, 'days').endOf('day').toDate(),
    perDayLimit: 2,
    totalLimit: 0,
  },
  {
    name: 'InValid Reward as it exceeds daily limit',
    startDate: moment().clone().subtract(2, 'days').startOf('day').toDate(),
    endDate: moment().clone().add(3, 'days').endOf('day').toDate(),
    perDayLimit: 0,
    totalLimit: 5,
  },
  {
    name: 'Has no coupon',
    startDate: moment().clone().subtract(2, 'days').startOf('day').toDate(),
    endDate: moment().clone().add(3, 'days').endOf('day').toDate(),
    perDayLimit: 5,
    totalLimit: 25,
  },
];
