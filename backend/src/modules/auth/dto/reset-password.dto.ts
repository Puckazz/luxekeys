import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @MinLength(1)
  token!: string;

  @ApiProperty({ example: 'NewPassword@123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
