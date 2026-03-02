import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt } from "class-validator";

export class AssignPermissionsDto {
	@ApiProperty({
		example: [1, 2, 3],
		description: "Danh sách ID permissions",
		type: [Number],
	})
	@IsArray()
	@IsInt({ each: true })
	permissionIds: number[];
}
