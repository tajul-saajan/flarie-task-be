import { IsNotEmpty, IsNumber, Validate } from 'class-validator';
import { Exists } from '../../validators/exists.validator';
import { Player } from '../../entities/Player';
import { Reward } from '../../entities/Reward';

export class CouponRedeemDto {
  @IsNotEmpty()
  @IsNumber()
  @Validate(Exists, [Player, 'id'], {
    message: "player doesn't exist",
  })
  playerId: number;

  @IsNotEmpty()
  @IsNumber()
  @Validate(Exists, [Reward, 'id'], {
    message: "reward doesn't exist",
  })
  rewardId: number;
}
