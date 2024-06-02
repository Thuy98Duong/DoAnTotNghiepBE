import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '1234',
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: JwtPayload) {
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
    };
  }
}
