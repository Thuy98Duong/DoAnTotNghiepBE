import { EPostPrivacy } from '../types';

export class Post {
  type: string;

  id: string;

  content: string;

  image?: string;

  privacy: EPostPrivacy;

  createdAt: number;

  replyCmtCount?: number;

  likeCount?: number;

  isLiked?: boolean;
}
