import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "src/users/user.service";
import { jwtConstants } from "./constant";
import type {
	SignInResponse,
	SignOutResponse,
	SignUpResponse,
} from "./auth.types";

@Injectable()
export class AuthService {
	private readonly blacklist = new Set<string>();

	constructor(
		private userService: UsersService,
		private jwtService: JwtService,
	) {}

	isTokenBlacklisted(token: string): boolean {
		return this.blacklist.has(token);
	}

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
		const payload = {
			id: user.id,
			username: user.username,
			role: user.role?.name || "",
		};
		return {
			access_token: await this.jwtService.signAsync(payload),
			message: "Đăng nhập thành công",
			type: "bearer",
			expiresIn: jwtConstants.expiresIn,
			isSuperAdmin: user.isSuperAdmin,
			user: {
				fullName: user.fullName,
				email: user.email,
				role: user.role?.name ?? "",
				branch: user.branch?.name ?? "",
			},
		};
	}

	async signUp(
		username: string,
		pass: string,
		email: string,
	): Promise<SignUpResponse> {
		const existingUser = await this.userService.findOne(username);
		if (existingUser) {
			throw new UnauthorizedException(
				"Tài khoản đã tồn tại. Vui lòng chọn tên đăng nhập khác",
			);
		}
		const newUser = await this.userService.create({
			username,
			password: pass,
			email,
		});

		return {
			message: "Đăng ký thành công",
			userId: newUser.id,
			username: newUser.username,
			email: newUser.email,
		};
	}

	async signOut(access_token: string): Promise<SignOutResponse> {
		try {
			await this.jwtService.verifyAsync(access_token);
			this.blacklist.add(access_token);
			return {
				message: "Đăng xuất thành công",
			};
		} catch (_error) {
			throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn");
		}
	}

	async getProfile(userId: number) {
		const user = await this.userService.findById(userId);
		if (!user) {
			throw new UnauthorizedException("Người dùng không tồn tại");
		}
		return user;
	}
}
