import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty({ example: 'Jane@123456' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: '+1-415-555-0199' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}
