import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class QueryAttendanceDto {
	@ApiPropertyOptional({ description: "Tháng (1-12)", example: 3 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(12)
	month?: number;

	@ApiPropertyOptional({ description: "Năm", example: 2026 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(2020)
	year?: number;

	@ApiPropertyOptional({ description: "ID nhân viên" })
	@IsOptional()
	userId?: string;
}
