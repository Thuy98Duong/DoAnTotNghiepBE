import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/CreatePost.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetPostDto } from './dto/GetPost.dto';

@Controller('post')
@ApiTags('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() body: CreatePostDto, @User() user: ReqUser) {
    return this.postService.create(body, user.id);
  }

  @Post('/:postId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  likePost(@Param('postId') postId, @User() user: ReqUser) {
    return this.postService.likePost(postId, user.id);
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getRecommendedPosts(@Query() query: GetPostDto, @User() user: ReqUser) {
    return this.postService.getRecommendedPost(query, user.id);
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyPosts(@User() user: ReqUser) {
    return this.postService.getPostById(user.id, user.id);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  searchPost(
    @Query('searchString') searchString: string,
    @User() user: ReqUser,
  ) {
    return this.postService.searchPostByContent(searchString ?? '', user.id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getPostByUserId(@Param('userId') userId: string, @User() user: ReqUser) {
    return this.postService.getPostById(userId, user.id);
  }

  @Delete('/:postId/unlike')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  unlikePost(@Param('postId') postId, @User() user: ReqUser) {
    return this.postService.unlikePost(postId, user.id);
  }
}
