import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Full name',
    type: String,
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL from cloud storage',
    type: String,
    example: 'https://res.cloudinary.com/...',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
