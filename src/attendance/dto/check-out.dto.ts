import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CheckOutDto {
	@ApiPropertyOptional({ description: "Ghi chú khi chấm công ra" })
	@IsOptional()
	@IsString()
	note?: string;
}
