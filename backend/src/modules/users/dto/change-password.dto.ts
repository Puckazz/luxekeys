import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    type: String,
    example: 'OldPass@123456',
  })
  @IsString()
  @MinLength(1)
  oldPassword!: string;

  @ApiProperty({
    description: 'New password',
    type: String,
    example: 'NewPass@123456',
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
