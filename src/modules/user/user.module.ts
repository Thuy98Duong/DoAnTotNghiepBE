import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { UserRepository } from './user.repository';

@Module({
  imports: [Neo4jModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
