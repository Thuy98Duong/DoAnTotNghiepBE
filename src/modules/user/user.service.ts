import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findOne(id: string) {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async getUserProfile(id: string, userId: string) {
    return this.userRepository.getUserProfile(id, userId);
  }

  async followUser(userId: string, followerId: string) {
    const followUserResult = await this.userRepository.followUserById(
      userId,
      followerId,
    );

    if (!followUserResult) {
      throw new BadRequestException('Can not follow user');
    }

    return {
      success: true,
    };
  }

  async unfollowUser(userId: string, followerId: string) {
    const followUserResult = await this.userRepository.unFollowUserById(
      userId,
      followerId,
    );

    if (!followUserResult) {
      throw new BadRequestException('Can not unfollow user');
    }

    return {
      success: true,
    };
  }

  async addFriend(userId1: string, userId2: string) {
    const addFriendResult = await this.userRepository.addFriendUserById(
      userId1,
      userId2,
    );

    if (!addFriendResult) {
      throw new BadRequestException('Can not add friend user');
    }

    return {
      success: true,
    };
  }

  async getFriendsByUserId(userId: string) {
    return {
      users: await this.userRepository.getFriendsByUserId(userId),
    };
  }

  async getFriendRecommendedByUserId(userId: string) {
    return {
      users: await this.userRepository.getFriendRecommendedByUserId(userId),
    };
  }

  async updateUser() {}

  async findUser(searchString: string, userId: string) {
    if (!searchString || !searchString.length) {
      return {
        users: [],
      };
    }

    return {
      users: await this.userRepository.getUserByFullName(searchString, userId),
    };
  }
}
