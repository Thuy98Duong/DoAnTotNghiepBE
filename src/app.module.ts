import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from './config/config.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule,
    Neo4jModule,
    UserModule,
    AuthModule,
    PostModule,
    CommentModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
