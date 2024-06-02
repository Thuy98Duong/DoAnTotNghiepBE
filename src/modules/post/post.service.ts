import { BadRequestException, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/CreatePost.dto';
import { GetPostDto } from './dto/GetPost.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  create(data: CreatePostDto, userId: string) {
    return this.postRepository.create(
      { ...data, createdAt: Date.now() },
      userId,
    );
  }

  async getPostById(userId: string, meId: string) {
    return {
      posts: await this.postRepository.getPostByUserId(userId, meId),
    };
  }

  async likePost(postId: string, userId: string) {
    const isLikedPost = await this.postRepository.isLikedPost({
      postId,
      userId,
    });

    if (isLikedPost) {
      throw new BadRequestException('Can not like post');
    }

    const result = await this.postRepository.likePost({ postId, userId });

    if (!result) {
      throw new BadRequestException('Can not like post');
    }

    return {
      success: true,
    };
  }

  async unlikePost(postId: string, userId: string) {
    const isLikedPost = await this.postRepository.isLikedPost({
      postId,
      userId,
    });

    if (!isLikedPost) {
      throw new BadRequestException('Can not unlike post');
    }

    const result = await this.postRepository.unlikePost({ postId, userId });

    if (!result) {
      throw new BadRequestException('Can not unlike post');
    }

    return {
      success: true,
    };
  }

  async getRecommendedPost(query: GetPostDto, userId: string) {
    return {
      posts: await this.postRepository.getRecommendedPost(userId, query),
    };
  }

  async searchPostByContent(searchString: string, userId: string) {
    if (!searchString || !searchString.length) {
      return {
        posts: [],
      };
    }

    return {
      posts: await this.postRepository.getPostByContent(searchString, userId),
    };
  }
}
