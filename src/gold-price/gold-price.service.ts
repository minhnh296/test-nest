import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Cron, CronExpression } from "@nestjs/schedule";
import { firstValueFrom } from "rxjs";
import { PrismaService } from "../prisma.services";

@Injectable()
export class GoldPriceService {
	private readonly logger = new Logger(GoldPriceService.name);
	private readonly GOLD_PRICE_URL =
		process.env.GOLD_PRICE_URL ||
		"https://sjc.com.vn/GoldPrice/Services/PriceService.ashx";

	constructor(
		private readonly httpService: HttpService,
		private readonly prisma: PrismaService,
	) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async handleCron() {
		this.logger.log("Bắt đầu fetch giá vàng SJC tự động...");
		await this.syncSjcPrices();
	}

	async getPricesFromDb() {
		return this.prisma.goldPrice.findMany({
			orderBy: { id: "asc" },
		});
	}

	async syncSjcPrices() {
		try {
			const payload = "method=GetCurrentGoldPricesByBranch&BranchId=1";
			const response = await firstValueFrom(
				this.httpService.post(this.GOLD_PRICE_URL, payload, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				}),
			);

			const { success, data, latestDate } = response.data;

			if (success && Array.isArray(data)) {
				for (const item of data) {
					await this.prisma.goldPrice.upsert({
						where: {
							type: item.TypeName,
						},
						update: {
							buy: item.BuyValue || 0,
							sell: item.SellValue || 0,
							latestDate: latestDate,
						},
						create: {
							type: item.TypeName,
							buy: item.BuyValue || 0,
							sell: item.SellValue || 0,
							latestDate: latestDate,
						},
					});
				}
				this.logger.log(`Đã cập nhật ${data.length} loại vàng từ SJC.`);
				return { success: true, count: data.length };
			}
		} catch (error) {
			this.logger.error("Lỗi khi fetch giá vàng SJC:", error.message);
			return { success: false, error: error.message };
		}
	}
}
