import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BranchType } from "@prisma/client";

export class CreateBranchDto {
	@ApiProperty({ example: "Chi nhánh Hà Nội 2", description: "Tên chi nhánh" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ example: "HN02", description: "Mã chi nhánh" })
	@IsString()
	@IsNotEmpty()
	code: string;

	@ApiPropertyOptional({
		example: "456 Gia Lâm, Hà Nội",
		description: "Địa chỉ chi nhánh",
	})
	@IsString()
	@IsOptional()
	address?: string;

	@ApiPropertyOptional({ example: "0909090909", description: "Số điện thoại" })
	@IsString()
	@IsOptional()
	phone?: string;

	@ApiPropertyOptional({
		enum: BranchType,
		default: BranchType.BRANCH,
		description: "Loại hình (Hội sở, Chi nhánh, Xưởng)",
	})
	@IsEnum(BranchType)
	@IsOptional()
	type?: BranchType;
}
