import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { comparePassword, hashPassword } from 'src/common/utils/helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    if (!comparePassword(user.password, password)) {
      throw new BadRequestException('Invalid email or password');
    }

    const payload = {
      id: user.id,
      email: user.mail,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
    };
  }

  async isEmailRegistered(mail: string) {
    const countUser = await this.userRepository.countByMail(mail);
    if (!countUser) {
      return {
        isExisted: false,
      };
    }

    return {
      isExisted: true,
    };
  }

  async register(data: any) {
    const { isExisted } = await this.isEmailRegistered(data.mail);

    if (isExisted) {
      throw new BadRequestException('Email already existed');
    }

    const user = await this.userRepository.create({
      ...data,
      password: hashPassword(data.password),
    });

    return user;
  }
}
