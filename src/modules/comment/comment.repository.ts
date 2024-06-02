import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';
import { TCreateCommentPayload } from './types';
import { Comment } from './entity/comment.entity';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class CommentRepository {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly userRepository: UserRepository,
  ) {}

  private async createRelationship(
    commentId: string,
    postId: string,
    userId: string,
  ) {
    const driver = await this.neo4jService.getDriver();

    driver.executeQuery(
      `MATCH (c:Comment {commentId:$commentId})
       MATCH (u:User {userId:$userId})
       MERGE (u)-[r:CREATE_CMT]->(c)`,
      {
        userId,
        commentId,
      },
    );

    driver.executeQuery(
      `MATCH (c:Comment {commentId:$commentId})
       MATCH (p:Post {postId:$postId})
       MERGE (p)-[r:REPLY_POST]->(c)`,
      {
        postId,
        commentId,
      },
    );
  }

  private mapFromRawData(rawData: any): Comment {
    return {
      id: rawData.commentId,
      content: rawData.content,
      createdAt: rawData.createdAt,
      user: rawData.user,
    };
  }

  async createComment({
    postId,
    userId,
    ...data
  }: TCreateCommentPayload): Promise<Comment> {
    const driver = await this.neo4jService.getDriver();

    const id = uuidv4();

    const { records } = await driver.executeQuery(
      `CREATE (p:Comment { commentId: $id, content: $content, createdAt: $createdAt }) RETURN p`,
      {
        ...data,
        id,
      },
    );

    if (!records || records.length === 0) {
      return null;
    }

    this.createRelationship(id, postId, userId);

    return this.mapFromRawData(
      this.neo4jService.mapToOneObject<Comment>(records),
    );
  }

  async replyComment(commentId: string, data: any) {
    const driver = await this.neo4jService.getDriver();

    const id = uuidv4();

    const { records } = await driver.executeQuery(
      `CREATE (p:Comment { commentId: $id, content: $content, createdAt: $createdAt }) RETURN p`,
      {
        ...data,
        id,
      },
    );

    if (!records || records.length === 0) {
      return null;
    }

    await driver.executeQuery(
      `
      MATCH (c:Comment {commentId: $id})
      MATCH (c1:Comment {commentId: $commentId})
      MERGE (c1)-[r:REPLY_CMT]->(c)`,
      {
        commentId,
        id,
      },
    );

    return this.mapFromRawData(
      this.neo4jService.mapToOneObject<Comment>(records),
    );
  }

  async getCommentsByPostId(postId: string) {
    const driver = await this.neo4jService.getDriver();
    const { records } = await driver.executeQuery(
      `MATCH (p: Post { postId: $postId })
      OPTIONAL MATCH (p) - [:REPLY_POST] -> (c)
      WITH p, c
      OPTIONAL MATCH (u) - [:CREATE_CMT] -> (c)
      WITH c, u
      OPTIONAL MATCH (c) - [:REPLY_CMT] -> (rc)
      WITH c, u, rc
      RETURN c, {userId: u.userId, firstname: u.firstname, lastname: u.lastname} as user, { childComments: collect(rc) } as replyCmt`,
      {
        postId,
      },
    );

    if (!records || records.length === 0 || !records[0]._fields[0]) {
      return [];
    }

    return records.map((record) => ({
      ...this.mapFromRawData(record._fields[0].properties),
      user: this.userRepository.mapFromRawData(record._fields[1]),
      childComments: record._fields[2].childComments.map((childComment) =>
        this.mapFromRawData(childComment.properties),
      ),
    }));
  }
}
