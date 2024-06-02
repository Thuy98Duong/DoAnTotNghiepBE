import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EPostPrivacy } from '../types';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  content: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  privacy: EPostPrivacy;

  @IsOptional()
  @IsString()
  @ApiProperty()
  image: string;
}
