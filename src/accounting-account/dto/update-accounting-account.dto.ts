import { PartialType } from "@nestjs/swagger";
import { CreateAccountingAccountDto } from "./create-accounting-account.dto";

export class UpdateAccountingAccountDto extends PartialType(
	CreateAccountingAccountDto,
) {}
