import { User } from 'src/modules/user/entities/user.entity';

export class Comment {
  id: string;

  content: string;

  createdAt: number;

  user?: User;

  childComments?: Comment[];
}
