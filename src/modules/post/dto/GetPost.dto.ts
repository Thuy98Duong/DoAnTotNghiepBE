import { IsEnum, IsOptional } from 'class-validator';
import { EPostType } from '../types';
import { ApiProperty } from '@nestjs/swagger';

export class GetPostDto {
  @IsOptional()
  @IsEnum(EPostType)
  @ApiProperty({ enum: EPostType })
  type: EPostType;
}
