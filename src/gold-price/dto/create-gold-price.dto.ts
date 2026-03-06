import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGoldPriceDto {
	@ApiProperty({
		description: "Loại vàng (VD: SJC 1L, Vàng nhẫn 9999...)",
		example: "Vàng nhẫn 9999",
	})
	@IsNotEmpty()
	@IsString()
	type: string;

	@ApiProperty({ description: "Giá mua vào", example: 85000000 })
	@IsNotEmpty()
	@IsNumber()
	buy: number;

	@ApiProperty({ description: "Giá bán ra", example: 87000000 })
	@IsNotEmpty()
	@IsNumber()
	sell: number;
}
