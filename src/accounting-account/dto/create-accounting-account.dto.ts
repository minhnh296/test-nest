import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AccountNature } from "@prisma/client";
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateAccountingAccountDto {
	@ApiProperty({ description: "Số hiệu tài khoản", example: "111" })
	@IsString()
	@IsNotEmpty()
	accountNumber: string;

	@ApiProperty({ description: "Tên tài khoản", example: "Tiền mặt" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: "Tính chất tài khoản",
		enum: AccountNature,
		example: "DEBIT",
	})
	@IsEnum(AccountNature)
	nature: AccountNature;

	@ApiProperty({ description: "Cấp của tài khoản", example: 1 })
	@IsInt()
	@IsNotEmpty()
	level: number;

	@ApiPropertyOptional({ description: "ID tài khoản cha", example: 1 })
	@IsOptional()
	@IsInt()
	parentId?: number;
}
