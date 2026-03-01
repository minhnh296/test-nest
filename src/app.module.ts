import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./users/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { BranchesModule } from "./branches/branch.module";
import { RoleModule } from "./roles/role.module";

@Module({
	imports: [AuthModule, UserModule, PrismaModule, BranchesModule, RoleModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
