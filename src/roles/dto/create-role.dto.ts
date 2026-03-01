import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsArray,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateRoleDto {
	@ApiProperty({ example: "admin", description: "Tên role (duy nhất)" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiPropertyOptional({
		example: "Quản trị viên hệ thống",
		description: "Mô tả role",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		example: [1, 2, 3],
		description: "Danh sách ID permissions gán cho role",
		type: [Number],
	})
	@IsArray()
	@IsInt({ each: true })
	@IsOptional()
	permissionIds?: number[];
}
