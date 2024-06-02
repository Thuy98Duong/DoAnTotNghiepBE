import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
      NEO4J_URI: process.env.NEO4J_URI,
      NEO4J_USER: process.env.NEO4J_USER,
      NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
    };
  }

  get(key: string): any {
    return this.envConfig[key];
  }
}
