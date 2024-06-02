import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentRepository } from './comment.repository';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [Neo4jModule, UserModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
})
export class CommentModule {}
