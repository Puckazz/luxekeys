import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ example: '+84901234567' })
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: '123 Nguyen Hue' })
  @IsString()
  @MaxLength(255)
  streetAddress!: string;

  @ApiProperty({ example: 'Ho Chi Minh' })
  @IsString()
  @MaxLength(100)
  province!: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({ example: 'Vietnam', default: 'Vietnam' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
