import {
	Controller,
	Get,
	Post,
	HttpException,
	HttpStatus,
	Query,
} from "@nestjs/common";
import { GoldPriceService } from "./gold-price.service";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
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
	@Get("history")
	@ApiOperation({ summary: "Lấy lịch sử giá vàng để vẽ biểu đồ" })
	@ApiQuery({
		name: "type",
		required: false,
		type: String,
		description: "Loại vàng (VD: SJC 1L)",
	})
	@ApiQuery({
		name: "from",
		required: false,
		type: String,
		description: "Từ ngày (YYYY-MM-DD)",
	})
	@ApiQuery({
		name: "to",
		required: false,
		type: String,
		description: "Đến ngày (YYYY-MM-DD)",
	})
	@ApiQuery({
		name: "limit",
		required: false,
		type: Number,
		description: "Số lượng bản ghi tối đa",
	})
	@ApiResponse({ status: 200, description: "Thành công" })
	async getHistory(
		@Query("type") type?: string,
		@Query("from") from?: string,
		@Query("to") to?: string,
		@Query("limit") limit?: number,
	) {
		try {
			return await this.goldPriceService.getHistory({ type, from, to, limit });
		} catch (error) {
			throw new HttpException(
				error.message || "Lỗi khi lấy lịch sử giá vàng",
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
