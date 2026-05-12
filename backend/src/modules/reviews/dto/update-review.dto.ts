import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto.js';

export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ['orderItemId'] as const),
) {}
