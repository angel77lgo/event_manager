import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as Joi from 'joi';

export async function processInBatches<T, R>(
  array: T[],
  func: (item: T) => Promise<R>,
  batchSize = 10,
) {
  const results: R[] = [];

  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(func));
    results.push(...batchResults);
  }

  return results;
}

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Joi.ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException(
        `Validation failed: ${error.details[0].message}`,
      );
    }
    return value;
  }
}
