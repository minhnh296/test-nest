import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsArray,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateRoleDto {
	@ApiProperty({ example: "test", description: "Tên role" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiPropertyOptional({
		example: "Kiểm thử",
		description: "Mô tả role",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		example: [2, 3, 4, 5, 6],
		description: "Danh sách ID permissions gán cho role",
		type: [Number],
	})
	@IsArray()
	@IsInt({ each: true })
	@IsOptional()
	permissionIds?: number[];
}
