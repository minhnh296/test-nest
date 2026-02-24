import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { jwtConstants } from "./constant";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./local.strategy";
import { UserModule } from "src/users/user.module";

@Module({
	imports: [
		UserModule,
		PassportModule,
		JwtModule.register({
			global: true,
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "600s" },
		}),
	],
	providers: [
		AuthService,
		LocalStrategy,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
