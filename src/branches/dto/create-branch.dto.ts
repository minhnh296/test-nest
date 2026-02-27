import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BranchType } from "@prisma/client";

export class CreateBranchDto {
	@ApiProperty({ example: "Chi nhánh Hà Nội 1", description: "Tên chi nhánh" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ example: "HN01", description: "Mã chi nhánh" })
	@IsString()
	@IsNotEmpty()
	code: string;

	@ApiPropertyOptional({
		example: "123 Cầu Giấy, Hà Nội",
		description: "Địa chỉ chi nhánh",
	})
	@IsString()
	@IsOptional()
	address?: string;

	@ApiPropertyOptional({ example: "0901234567", description: "Số điện thoại" })
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
