import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class AssignRoleDto {
	@ApiProperty({ example: 1, description: "ID của người dùng" })
	@IsInt()
	@IsNotEmpty()
	userId: number;

	@ApiProperty({ example: 2, description: "ID của Role muốn gán" })
	@IsInt()
	@IsNotEmpty()
	roleId: number;
}
