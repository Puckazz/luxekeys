import { IsBoolean } from 'class-validator';

export class KeyboardConnectivityDto {
  @IsBoolean()
  wired!: boolean;

  @IsBoolean()
  bluetooth!: boolean;

  @IsBoolean()
  wireless24g!: boolean;
}
