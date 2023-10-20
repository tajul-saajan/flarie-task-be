import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RewardService } from '../src/reward/reward.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from '../src/entities/Reward';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';
import { Player } from '../src/entities/Player';
import { PlayerCoupon } from '../src/entities/PlayerCoupon';
import { Coupon } from '../src/entities/Coupon';
import * as moment from 'moment';
import { AppModule } from '../src/app.module';

const databaseConfig: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'aaaaaa',
  database: 'e2e',
  entities: [Player, Reward, Coupon, PlayerCoupon],
  synchronize: true,
  migrationsRun: true,
};
const dataSource = new DataSource(databaseConfig);
describe('AppController', () => {
  let app: INestApplication;
  let rewardRepository: Repository<Reward>;
  let playerRepository: Repository<Player>;
  let couponRepository: Repository<Coupon>;

  beforeAll(async () => {
    await dataSource.initialize();
    await dataSource.synchronize();

    rewardRepository = dataSource.getRepository(Reward);
    playerRepository = dataSource.getRepository(Player);
    couponRepository = dataSource.getRepository(Coupon);
    //
    for (const r of rewardsToCreate) {
      await rewardRepository.save(r);
    }
    for (const p of playersToCreate) {
      await playerRepository.save(p);
    }
    for (const c of couponsToCreate) {
      await couponRepository.save(c);
    }
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({ ...databaseConfig, autoLoadEntities: true }),
      ],
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

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  it('dummy api should return 200', () => {
    return request(app.getHttpServer())
      .get('/reward')
      .expect(200)
      .expect('it works');
  });

  it('should return 404 as player or reward exists', () => {
    return request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 55, rewardId: 55 })
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'Reward id or Player id is invalid',
      });
  });

  it('should throw 500 as coupon is expired', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .set({ playerId: 1, rewardId: 3 });
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({});
  });
});

const rewardsToCreate: Partial<Reward>[] = [
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
];

const playersToCreate = [
  { name: 'Player 1' },
  { name: 'Player 2' },
  { name: 'Player 3' },
];

const couponsToCreate = [{ value: 'SAH75', rewardId: 1 }];
