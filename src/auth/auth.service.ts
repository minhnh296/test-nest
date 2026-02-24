import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (!user) {
      throw new UnauthorizedException(
        'Sai tài khoản, mật khẩu. Vui lòng đăng nhập lại',
      );
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        'Sai tài khoản, mật khẩu. Vui lòng đăng nhập lại',
      );
    }
    const payload = { id: user.userId, username: user.username };
    return {
      message: 'Đăng nhập thành công',
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
