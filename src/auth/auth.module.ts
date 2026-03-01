import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/users/user.module";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { RolesGuard } from "./roles.guard";
import { AuthService } from "./auth.service";
import { jwtConstants } from "./constant";
import { LocalStrategy } from "./local.strategy";

@Module({
	imports: [
		UserModule,
		PassportModule,
		JwtModule.register({
			global: true,
			secret: jwtConstants.secret,
			signOptions: { expiresIn: jwtConstants.expiresIn },
		}),
	],
	providers: [
		AuthService,
		LocalStrategy,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
