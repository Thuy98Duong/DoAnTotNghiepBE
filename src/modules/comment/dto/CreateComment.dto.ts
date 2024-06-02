import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  postId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  content: string;
}
