import { Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Module({
  imports: [],
  providers: [Neo4jService],
  exports: [Neo4jService],
})
export class Neo4jModule {}
