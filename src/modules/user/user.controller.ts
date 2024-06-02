import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMe(@User() user: ReqUser) {
    const me = await this.userService.findOne(user.id);
    delete me.password;

    return me;
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  searchUserByFullname(
    @Query('searchString') searchString: string,
    @User() user: ReqUser,
  ) {
    return this.userService.findUser(searchString, user.id);
  }

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFriends(@User() user: ReqUser) {
    return this.userService.getFriendsByUserId(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post('follow/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  followUser(@User() user: ReqUser, @Param('userId') userId: string) {
    return this.userService.followUser(userId, user.id);
  }

  @Post('add-friend/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addFriend(@User() user: ReqUser, @Param('userId') userId: string) {
    return this.userService.addFriend(userId, user.id);
  }

  @Get('friends/recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFriendRecommended(@User() user: ReqUser) {
    return this.userService.getFriendRecommendedByUserId(user.id);
  }

  @Get('profile/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getUserProfile(@Param('userId') id: string, @User() user: ReqUser) {
    return this.userService.getUserProfile(id, user.id);
  }
}
