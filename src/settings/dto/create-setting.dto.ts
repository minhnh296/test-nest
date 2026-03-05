import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSettingDto {
	@ApiProperty({ description: "Từ khóa cấu hình duy nhất" })
	@IsNotEmpty()
	@IsString()
	key: string;

	@ApiProperty({
		description:
			'Giá trị của cấu hình. Có thể là số dạng chuỗi "10.5" hoặc chuỗi JSON cho công thức',
	})
	@IsNotEmpty()
	@IsString()
	value: string;

	@ApiPropertyOptional({
		description:
			'Kiểu dữ liệu của cấu hình, ví dụ: "number", "formula", "json"',
		default: "string",
	})
	@IsOptional()
	@IsString()
	type?: string;

	@ApiPropertyOptional({ description: "Mô tả chi tiết cấu hình" })
	@IsOptional()
	@IsString()
	description?: string;
}
