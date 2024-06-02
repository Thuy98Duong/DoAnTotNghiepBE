import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [Neo4jModule, UserModule],
  controllers: [PostController],
  providers: [PostService, PostRepository],
})
export class PostModule {}
