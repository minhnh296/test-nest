import {
	Controller,
	Get,
	Post,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { GoldPriceService } from "./gold-price.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/public.decorator";

@ApiTags("Gold Price")
@Controller("gold-prices")
export class GoldPriceController {
	constructor(private readonly goldPriceService: GoldPriceService) {}

	@Public()
	@Get()
	@ApiOperation({ summary: "Lấy danh sách giá vàng mới nhất từ Database" })
	@ApiResponse({ status: 200, description: "Thành công" })
	@ApiResponse({ status: 500, description: "Có lỗi khi truy xuất Database" })
	async getPrices() {
		try {
			return await this.goldPriceService.getPricesFromDb();
		} catch {
			throw new HttpException(
				"Lỗi hệ thống khi lấy giá vàng",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	@Public()
	@Post("sync")
	@ApiOperation({ summary: "Chủ động trigger fetch dữ liệu mới" })
	@ApiResponse({ status: 201, description: "Đồng bộ giá vàng thành công" })
	@ApiResponse({ status: 500, description: "Có lỗi khi update Database" })
	async syncPrices() {
		const result = await this.goldPriceService.syncSjcPrices();

		if (!result || !result.success) {
			throw new HttpException(
				result?.error || "Không thể đồng bộ giá vàng lúc này",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		return result;
	}
}
