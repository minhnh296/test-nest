import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import type { AuthService } from "./auth.service";
import type { SignInResponse } from "./auth.types";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<SignInResponse> {
		const user = await this.authService.signIn(username, password);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
