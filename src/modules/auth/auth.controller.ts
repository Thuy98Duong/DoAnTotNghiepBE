import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Post('is-email-existed')
  isEmailAlreadyExisted(@Body('mail') mail: string) {
    return this.authService.isEmailRegistered(mail);
  }
}
