import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePermissionDto {
	@ApiProperty({
		example: "CREATE_USER",
		description: "Tên định danh của quyền",
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		example: "Quyền tạo người dùng mới",
		description: "Mô tả chi tiết quyền",
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;
}
