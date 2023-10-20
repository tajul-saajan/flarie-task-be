import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { RewardService } from '../src/reward/reward.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from '../src/entities/Reward';
import { DataSource, Repository } from 'typeorm';
import { Player } from '../src/entities/Player';
import { PlayerCoupon } from '../src/entities/PlayerCoupon';
import { Coupon } from '../src/entities/Coupon';
import { AppModule } from '../src/app.module';
import { PlayerService } from '../src/player/player.service';
import { PlayerCouponService } from '../src/player-coupon/player-coupon.service';
import { CouponService } from '../src/coupon/coupon.service';
import { Exists } from '../src/validators/exists.validator';
import { APP_PIPE } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { RewardModule } from '../src/reward/reward.module';
import coupons from './test-utis/coupons';
import { createTestDataSource, TestDBInitiator } from './config.e2e';

describe('AppController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let databaseConfig: TestDBInitiator;

  beforeAll(async () => {
    databaseConfig = new TestDBInitiator();
    dataSource = await createTestDataSource(databaseConfig.dbOptions);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...databaseConfig.dbOptions,
          autoLoadEntities: true,
        }),
        AppModule,
      ],
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
        PlayerCouponService,
        {
          provide: getRepositoryToken(PlayerCoupon),
          useClass: Repository,
        },
        CouponService,
        {
          provide: getRepositoryToken(Coupon),
          useClass: Repository,
        },
        Exists,
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(RewardModule), { fallbackOnErrors: true });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  beforeEach(async () => {});

  afterEach(async () => {});

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  it('dummy api should return 200', () => {
    return request(app.getHttpServer())
      .get('/reward')
      .expect(200)
      .expect('it works');
  });

  it('should return 400 as empty payload given', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send();
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: [
        'playerId must be a number conforming to the specified constraints',
        'playerId should not be empty',
        'rewardId must be a number conforming to the specified constraints',
        'rewardId should not be empty',
      ],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should return 400 as player and reward do not exist', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 55, rewardId: 55 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: 'Bad Request',
      message: ["player doesn't exist", "reward doesn't exist"],
      statusCode: 400,
    });
  });

  it('should return 400 as player does not exist', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 55, rewardId: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: 'Bad Request',
      message: ["player doesn't exist"],
      statusCode: 400,
    });
  });

  it('should return 400 as reward does not exist', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 1, rewardId: 55 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: 'Bad Request',
      message: ["reward doesn't exist"],
      statusCode: 400,
    });
  });

  it('should return new coupon as it satisfied all conditions', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 1, rewardId: 1 });
    expect(res.statusCode).toBe(201);
    const { value } = coupons[0];
    expect(res.body).toEqual({ id: 1, value });
  });

  it('should return 404 as new no coupons available', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 1, rewardId: 1 });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: 'no coupon left to redeem',
      statusCode: 404,
    });
  });

  it('should return 412 as no coupons available for redeem', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 1, rewardId: 2 });
    expect(res.statusCode).toBe(HttpStatus.PRECONDITION_FAILED);
    expect(res.body).toEqual({
      message: 'Coupon is not valid anymore',
      statusCode: 412,
    });
  });

  it('should return 412 as no reward exceeds its total limit', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 1, rewardId: 3 });
    expect(res.statusCode).toBe(HttpStatus.PRECONDITION_FAILED);
    expect(res.body).toEqual({
      message: 'total limit already has been reached',
      statusCode: HttpStatus.PRECONDITION_FAILED,
    });
  });

  it('should return 412 as no reward exceeds its daily limit', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 1, rewardId: 4 });
    expect(res.statusCode).toBe(HttpStatus.PRECONDITION_FAILED);
    expect(res.body).toEqual({
      message: 'daily limit already has been reached',
      statusCode: HttpStatus.PRECONDITION_FAILED,
    });
  });

  it('should return 404 as the reward has no coupons', async () => {
    const res = await request(app.getHttpServer())
      .post('/reward/coupon-redeem')
      .send({ playerId: 1, rewardId: 5 });
    expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(res.body).toEqual({
      message: 'no coupon left to redeem',
      statusCode: 404,
    });
  });
});
