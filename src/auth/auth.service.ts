import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { UsersService } from "src/users/user.service";
import type {
	SignInResponse,
	SignOutResponse,
	SignUpResponse,
} from "./auth.types";

@Injectable()
export class AuthService {
	constructor(
		private userService: UsersService,
		private jwtService: JwtService,
	) {}

	async signIn(username: string, pass: string): Promise<SignInResponse> {
		const user = await this.userService.findOne(username);
		if (!user) {
			throw new UnauthorizedException(
				"Sai tài khoản, mật khẩu. Vui lòng đăng nhập lại",
			);
		}
		const isMatch = await bcrypt.compare(pass, user.password);
		if (!isMatch) {
			throw new UnauthorizedException(
				"Sai tài khoản, mật khẩu. Vui lòng đăng nhập lại",
			);
		}
		const payload = { id: user.userId, username: user.username };
		return {
			message: "Đăng nhập thành công",
			access_token: await this.jwtService.signAsync(payload),
		};
	}

	async signUp(username: string, pass: string): Promise<SignUpResponse> {
		const existingUser = await this.userService.findOne(username);
		if (existingUser) {
			throw new UnauthorizedException(
				"Tài khoản đã tồn tại. Vui lòng chọn tên đăng nhập khác",
			);
		}
		const newUser = await this.userService.create({
			username,
			password: pass,
		});

		return {
			message: "Đăng ký thành công",
			userId: newUser.userId,
			username: newUser.username,
		};
	}

	async signOut(access_token: string): Promise<SignOutResponse> {
		try {
			await this.jwtService.verifyAsync(access_token);
			return {
				message: "Đăng xuất thành công",
			};
		} catch (_error) {
			throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn");
		}
	}
}
