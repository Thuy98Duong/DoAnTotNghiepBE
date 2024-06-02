import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { User } from './entities/user.entity';
import { Date as Neo4jDate } from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserRepository {
  constructor(private readonly neo4jService: Neo4jService) {}

  async countByMail(mail: string) {
    const driver = await this.neo4jService.getDriver();

    const { records } = await driver.executeQuery(
      `MATCH (u:User { mail: $mail }) RETURN count(u)`,
      { mail },
    );

    if (!records || !records.length) {
      return null;
    }

    return records[0]._fields[0].low;
  }

  async create(data: User): Promise<User> {
    const driver = await this.neo4jService.getDriver();
    const BOD = new Date(data.BOD);

    const { records } = await driver.executeQuery(
      `CREATE (u:User {
        firstname: $firstname,
        gender: $gender,
        mail: $mail,
        pass: $pass,
        BOD: $BOD,
        userId: $userId,
        lastname: $lastname
      }) RETURN u`,
      {
        ...data,
        userId: uuidv4(),
        pass: data.password,
        BOD: new Neo4jDate(BOD.getFullYear(), BOD.getMonth(), BOD.getDay()),
      },
    );

    if (!records || records.length === 0) {
      return null;
    }

    return this.mapFromRawData(this.neo4jService.mapToOneObject<User>(records));
  }

  async getUserByEmail(email: string) {
    const driver = await this.neo4jService.getDriver();
    const { records } = await driver.executeQuery(
      `MATCH (u:User {mail: $email}) RETURN u`,
      {
        email,
      },
    );

    if (!records || !records.length) {
      return null;
    }

    return this.mapFromRawData(this.neo4jService.mapToOneObject<User>(records));
  }

  async getUserProfile(id: string, userId: string) {
    const driver = await this.neo4jService.getDriver();
    const { records } = await driver.executeQuery(
      `MATCH (u:User {userId: $id})
       MATCH (user2:User { userId: $userId })
      RETURN u, EXISTS((u)-[:FRIEND]-(user2)) AS isFriend, EXISTS((u)-[:FOLLOW]->(user2)) AS isFollowing`,
      {
        id,
        userId,
      },
    );

    if (!records || !records.length) {
      return null;
    }

    const isFriend = records[0]._fields[1];
    const isFollowing = records[0]._fields[2];

    return {
      ...this.mapFromRawData(this.neo4jService.mapToOneObject<User>(records)),
      isFriend,
      isFollowing: isFriend ?? isFollowing,
    };
  }

  async getUserById(id: string) {
    const driver = await this.neo4jService.getDriver();
    const { records } = await driver.executeQuery(
      `MATCH (u:User {userId: $id}) RETURN u`,
      {
        id,
      },
    );

    if (!records || !records.length || !records[0]._fields[0]) {
      return null;
    }

    return this.mapFromRawData(this.neo4jService.mapToOneObject<User>(records));
  }

  async getFriendsByUserId(userId: string) {
    const driver = await this.neo4jService.getDriver();
    const { records } = await driver.executeQuery(
      `MATCH (u:User {userId: $userId})-[r:FRIEND]-(u2:User) RETURN u2`,
      {
        userId,
      },
    );

    return records.map((record) =>
      this.mapFromRawData(record._fields[0].properties),
    );
  }

  async getFriendRecommendedByUserId(userId: string) {
    const driver = await this.neo4jService.getDriver();
    const { records } = await driver.executeQuery(
      `MATCH (user1:User {userId: $userId})
      WITH user1
      MATCH (user2:User)
      WHERE NOT (user1)-[:FRIEND]-(user2)
      RETURN user2 LIMIT 10`,
      {
        userId,
      },
    );

    return records.map((record) =>
      this.mapFromRawData(record._fields[0].properties),
    );
  }

  async followUserById(userId: string, followerId: string) {
    const driver = await this.neo4jService.getDriver();
    const { records } = await driver.executeQuery(
      `MATCH (u:User {userId: $userId}) MATCH (u2:User {userId: $followerId}) CREATE (u)-[r:FOLLOW]->(u2) RETURN r`,
      {
        userId,
        followerId,
      },
    );

    if (!records || !records.length) {
      return null;
    }

    return records;
  }

  async unFollowUserById(userId: string, followerId: string) {
    const driver = await this.neo4jService.getDriver();
    const { records } = await driver.executeQuery(
      `MATCH (u1:User {userId: $userId1}) - [r:FRIEND]- (u2:User {userId: $followerId}) DELETE r RETURN r`,
      {
        userId,
        followerId,
      },
    );

    if (!records || !records.length) {
      return null;
    }

    return records;
  }

  async addFriendUserById(userId1: string, userId2: string) {
    const driver = await this.neo4jService.getDriver();
    const { records } = await driver.executeQuery(
      `MATCH (u1:User {userId: $userId1}) 
      MATCH (u2:User {userId: $userId2}) 
      MERGE (u1) - [r:FRIEND]-(u2)
      RETURN r`,
      {
        userId1,
        userId2,
      },
    );

    if (!records || !records.length) {
      return null;
    }

    return records;
  }

  async getUserByFullName(fullName: string, meId: string) {
    const driver = await this.neo4jService.getDriver();

    const { records } = await driver.executeQuery(
      `MATCH (u:User)
      WITH u, u.firstname + ' ' + u.lastname AS fullname
      WHERE fullname CONTAINS $search
      MATCH (user2:User { userId: $meId })
      WITH u, user2, EXISTS((u)-[:FRIEND]-(user2)) AS isFriend, EXISTS((u)-[:FOLLOW]->(user2)) AS isFollowing
      ORDER BY isFriend DESC
      RETURN u, isFriend, isFollowing`,
      {
        search: fullName,
        meId,
      },
    );

    return records.map((record) => {
      const isFriend = record._fields[1];
      const isFollowing = record._fields[2];

      return {
        ...this.mapFromRawData(record._fields[0].properties),
        isFriend,
        isFollowing: isFriend ?? isFollowing,
      };
    });
  }

  mapFromRawData(rawData: any): User {
    const BOD: Neo4jDate = rawData.BOD;

    return {
      id: rawData.userId,
      firstname: rawData.firstname,
      gender: rawData.gender,
      mail: rawData.mail,
      password: rawData.pass,
      lastname: rawData.lastname,
      BOD: BOD ? new Date(BOD.toString()).getTime() : undefined,
    };
  }
}
