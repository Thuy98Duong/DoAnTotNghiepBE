import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/CreateComment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('comment')
@ApiTags('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createComment(@Body() data: CreateCommentDto, @User() user: ReqUser) {
    return this.commentService.createComment(data, user.id);
  }

  @Get(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getCommentByPostId(@Param('postId') postId: string) {
    return this.commentService.getCommentsByPostId(postId);
  }
}
