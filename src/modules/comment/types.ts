import { Comment } from './entity/comment.entity';

export type TCreateCommentPayload = Omit<Comment, 'id'> & {
  userId: string;

  postId: string;
};
