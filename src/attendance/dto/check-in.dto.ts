import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CheckInDto {
	@ApiPropertyOptional({ description: "Ghi chú khi chấm công vào" })
	@IsOptional()
	@IsString()
	note?: string;
}
