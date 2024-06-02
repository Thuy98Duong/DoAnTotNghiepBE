import { Injectable } from '@nestjs/common';
import { Post } from './entities/post.entity';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class PostRepository {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly userRepository: UserRepository,
  ) {}

  async create(data: Omit<Post, 'id'>, userId: string): Promise<Post> {
    const driver = await this.neo4jService.getDriver();

    const id = uuidv4();

    const payload = { ...data, id };

    const { records } = await driver.executeQuery(
      `CREATE (p:Post {${this.mapToPayloadString(payload)}}) RETURN p`,
      payload,
    );

    if (!records || records.length === 0) {
      return null;
    }

    const postData = this.mapFromRawData(
      this.neo4jService.mapToOneObject<Post>(records),
    );

    this.createCreatePostRelationship(postData.id, userId);

    return postData;
  }

  async getRecommendedPost(meId: string, filter?: any) {
    const driver = await this.neo4jService.getDriver();

    const { records } = await driver.executeQuery(
      `
      MATCH (p:Post {${this.mapToPayloadString(filter)}})
      OPTIONAL MATCH (u:User) - [:CREATE_POST] -> (p)
      WITH p, u
      OPTIONAL MATCH (c:Comment) - [:REPLY_POST] -> (p)
      WITH p, COUNT(c) AS replyPostCount, u
      OPTIONAL MATCH (c1:Comment) - [:REPLY_CMT] ->(c2:Comment) -[:REPLY_POST] ->(p)
      WITH p, replyPostCount, COUNT(c1) AS replyCmtCount, u
      OPTIONAL MATCH ()-[lp:LIKE_POST]->(p)
      WITH p, replyPostCount, replyCmtCount, COUNT(lp) AS likeCount, u
      OPTIONAL MATCH (me:User { userId: $meId })-[liked:LIKE_POST]->(p)
      WITH p, replyPostCount * 1.0 + replyCmtCount * 1.0 + likeCount * 0.5 AS score, replyCmtCount, u, likeCount, COUNT(liked) as isLiked
      ORDER BY score DESC
      RETURN  p, {userId: u.userId, firstname: u.firstname, lastname: u.lastname} as user, replyCmtCount, likeCount, isLiked`,
      {
        ...filter,
        meId,
      },
    );

    if (!records || records.length === 0) {
      return [];
    }

    return records.map((record) => ({
      ...this.mapFromRawData(record._fields[0].properties),
      user: this.userRepository.mapFromRawData(record._fields[1]),
      replyCmtCount: record._fields[2].low,
      likeCount: record._fields[3].low,
      isLiked: Boolean(record._fields[4].low),
    }));
  }

  async getPostByUserId(userId: string, meId: string) {
    const driver = await this.neo4jService.getDriver();

    const { records } = await driver.executeQuery(
      `
      MATCH (u:User { userId: $userId })
      OPTIONAL MATCH (u) - [:CREATE_POST] -> (p)
      WITH p, u
      OPTIONAL MATCH (c:Comment) - [:REPLY_POST] -> (p)
      WITH p, COUNT(c) AS replyPostCount, u
      OPTIONAL MATCH (c1:Comment) - [:REPLY_CMT] ->(c2:Comment) -[:REPLY_POST] ->(p)
      WITH p, replyPostCount, COUNT(c1) AS replyCmtCount, u
      OPTIONAL MATCH ()-[lp:LIKE_POST]->(p)
      WITH p, replyPostCount, replyCmtCount, COUNT(lp) AS likeCount, u
      OPTIONAL MATCH (me:User { userId: $meId })-[liked:LIKE_POST]->(p)
      WITH p, replyCmtCount, u, likeCount, COUNT(liked) as isLiked
      ORDER BY p.createdAt DESC
      RETURN  p, {userId: u.userId, firstname: u.firstname, lastname: u.lastname} as user, replyCmtCount, likeCount, isLiked`,
      {
        userId,
        meId,
      },
    );

    if (!records || records.length === 0 || !records[0]._fields[0]) {
      return [];
    }

    return records.map((record) => ({
      ...this.mapFromRawData(record._fields[0].properties),
      user: this.userRepository.mapFromRawData(record._fields[1]),
      replyCmtCount: record._fields[2].low,
      likeCount: record._fields[3].low,
      isLiked: Boolean(record._fields[4].low),
    }));
  }

  async likePost({ postId, userId }: { postId: string; userId: string }) {
    const driver = await this.neo4jService.getDriver();

    const { records } = await driver.executeQuery(
      `MATCH (u:User { userId: $userId })
       MATCH (p:Post { postId: $postId })
       MERGE (u)-[r:LIKE_POST]->(p)
       RETURN r`,
      {
        userId,
        postId,
      },
    );

    if (!records || !records.length) {
      return null;
    }

    return records;
  }

  async unlikePost({ postId, userId }) {
    const driver = await this.neo4jService.getDriver();

    const { records } = await driver.executeQuery(
      `MATCH (u:User { userId: $userId }) - [r:LIKE_POST]->(p:Post { postId: $postId }) 
       DELETE r RETURN r`,
      {
        userId,
        postId,
      },
    );

    if (!records || !records.length) {
      return null;
    }

    return records;
  }

  async isLikedPost({ postId, userId }) {
    const driver = await this.neo4jService.getDriver();

    const { records } = await driver.executeQuery(
      `MATCH (u:User { userId: $userId }) - [r:LIKE_POST]->(p:Post { postId: $postId }) 
       RETURN r`,
      {
        userId,
        postId,
      },
    );

    if (!records || !records.length) {
      return false;
    }

    return true;
  }

  async getPostByContent(content: string, meId: string) {
    const driver = await this.neo4jService.getDriver();

    const { records } = await driver.executeQuery(
      `
      MATCH (p:Post)
      WHERE p.title CONTAINS $content
      OPTIONAL MATCH (u:User) - [:CREATE_POST] -> (p)
      WITH p, u
      OPTIONAL MATCH (c:Comment) - [:REPLY_POST] -> (p)
      WITH p, COUNT(c) AS replyPostCount, u
      OPTIONAL MATCH (c1:Comment) - [:REPLY_CMT] ->(c2:Comment) -[:REPLY_POST] ->(p)
      WITH p, replyPostCount, COUNT(c1) AS replyCmtCount, u
      OPTIONAL MATCH ()-[lp:LIKE_POST]->(p)
      WITH p, replyPostCount, replyCmtCount, COUNT(lp) AS likeCount, u
      OPTIONAL MATCH (me:User { userId: $meId })-[liked:LIKE_POST]->(p)
      WITH p, replyPostCount * 1.0 + replyCmtCount * 1.0 + likeCount * 0.5 AS score, replyCmtCount, u, likeCount, COUNT(liked) as isLiked
      ORDER BY score DESC
      RETURN  p, {userId: u.userId, firstname: u.firstname, lastname: u.lastname} as user, replyCmtCount, likeCount, isLiked`,
      {
        meId,
        content,
      },
    );

    if (!records || records.length === 0 || !records[0]._fields[0]) {
      return [];
    }

    return records.map((record) => ({
      ...this.mapFromRawData(record._fields[0].properties),
      user: this.userRepository.mapFromRawData(record._fields[1]),
      replyCmtCount: record._fields[2].low,
      likeCount: record._fields[3].low,
      isLiked: Boolean(record._fields[4].low),
    }));
  }

  private mapToPayloadString(filter?: any) {
    if (!filter) {
      return '';
    }

    return Object.keys(filter)
      .map((key) => {
        if (key === 'type') {
          return `typePost: $type`;
        }

        if (key === 'id') {
          return `postId: $id`;
        }

        if (key === 'content') {
          return `title: $content`;
        }

        return `${key}: $${key}`;
      })
      .join(', ');
  }

  private async createCreatePostRelationship(postId: string, userId: string) {
    const driver = await this.neo4jService.getDriver();

    await driver.executeQuery(
      `MATCH (u:User {userId:$userId})
       MATCH (p:Post {postId:$postId})
       MERGE (u)-[r:CREATE_POST]->(p)`,
      {
        postId,
        userId,
      },
    );
  }

  private mapFromRawData(rawData: any): Post {
    return {
      id: rawData.postId,
      type: rawData.typePost,
      content: rawData.title,
      image: rawData.image,
      privacy: rawData.privacy,
      createdAt: rawData.createdAt,
    };
  }
}
