import { Injectable } from '@nestjs/common';
import neo4j from 'neo4j-driver';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class Neo4jService {
  constructor(private readonly configService: ConfigService) {}

  async getDriver() {
    const URI = this.configService.get('NEO4J_URI');
    const USER = this.configService.get('NEO4J_USER');
    const PASSWORD = this.configService.get('NEO4J_PASSWORD');
    let driver;

    try {
      driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    } catch (err) {
      console.log(`Connection error\n${err}\nCause: ${err.cause}`);
      throw err;
    }

    return driver;
  }

  mapToOneObject<T>(records: Array<any>): T {
    return records.map((record) => record._fields[0].properties)[0];
  }

  mapToArrayObject<T>(records: Array<any>): T[] {
    return records.map((record) => record._fields[0].properties);
  }

  mapToArrayObjectWithRelationship(records: Array<any>) {
    return records.map((record) => ({
      start: record._fields[0].start.properties,
      end: record._fields[0].end.properties,
      segments: record._fields[0].segments.map((segment) => ({
        start: segment.start.properties,
        end: segment.end.properties,
      })),
    }));
  }
}
