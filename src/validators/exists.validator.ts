import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from 'typeorm';

@ValidatorConstraint({ name: 'exists', async: true })
@Injectable()
export class Exists implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  validate = async (
    value: any,
    args: ValidationArguments,
  ): Promise<boolean> => {
    const [entityClass, fieldName] = args.constraints;

    const count = await this.entityManager.count(entityClass, {
      where: {
        [fieldName]: value,
      },
    });

    return !!count;
  };
}
