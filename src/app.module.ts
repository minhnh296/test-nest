import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./users/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { BranchesModule } from "./branches/branch.module";
import { RoleModule } from "./roles/role.module";
import { AccountingAccountModule } from "./accounting-account/accounting-account.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { AuthGuard } from "./auth/auth.guard";
import { RolesGuard } from "./roles/guards/roles.guard";
import { APP_GUARD } from "@nestjs/core";

@Module({
	imports: [
		AuthModule,
		UserModule,
		PrismaModule,
		RoleModule,
		BranchesModule,
		AccountingAccountModule,
		AttendanceModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
})
export class AppModule {}
