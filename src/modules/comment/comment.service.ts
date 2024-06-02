import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/CreateComment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  createComment(data: CreateCommentDto, userId: string) {
    return this.commentRepository.createComment({
      ...data,
      userId,
      createdAt: Date.now(),
    });
  }

  async getCommentsByPostId(postId: string) {
    return {
      comments: await this.commentRepository.getCommentsByPostId(postId),
    };
  }
}
