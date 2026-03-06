import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class AssignRoleDto {
	@ApiProperty({ example: "uuid-user-id", description: "ID của người dùng" })
	@IsString()
	@IsNotEmpty()
	userId: string;

	@ApiProperty({ example: 2, description: "ID của Role muốn gán" })
	@IsInt()
	@IsNotEmpty()
	roleId: number;
}
