import { Module } from "@nestjs/common";
import { AccountingAccountService } from "./accounting-account.service";
import { AccountingAccountController } from "./accounting-account.controller";

@Module({
	controllers: [AccountingAccountController],
	providers: [AccountingAccountService],
})
export class AccountingAccountModule {}
