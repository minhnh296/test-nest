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
import { RolesGuard } from "./roles/guards/roles.guard";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { GoldPriceModule } from "./gold-price/gold-price.module";
import { SettingModule } from "./settings/setting.module";
import { AuthGuard } from "./auth/guard/auth.guard";

@Module({
	imports: [
		AuthModule,
		UserModule,
		PrismaModule,
		RoleModule,
		BranchesModule,
		AccountingAccountModule,
		AttendanceModule,
		ScheduleModule.forRoot(),
		GoldPriceModule,
		SettingModule,
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
