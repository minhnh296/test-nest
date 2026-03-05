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
		await this.syncSjcPrices();
	}

	async getPricesFromDb() {
		return this.prisma.goldPrice.findMany({
			orderBy: { id: "asc" },
		});
	}

	async getHistory(query: {
		type?: string;
		from?: string;
		to?: string;
		limit?: number;
	}) {
		const { type, from, to, limit = 100 } = query;

		const where: import("@prisma/client").Prisma.GoldPriceHistoryWhereInput =
			{};
		if (type) where.type = type;
		if (from || to) {
			where.date = {
				gte: from ? new Date(from) : undefined,
				lte: to ? new Date(to) : undefined,
			};
		}

		return this.prisma.goldPriceHistory.findMany({
			where,
			orderBy: { date: "desc" },
			take: Number(limit),
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
				const currentPrices = await this.prisma.goldPrice.findMany();
				const priceMap = new Map(currentPrices.map((p) => [p.type, p]));

				let updatedCount = 0;

				for (const item of data) {
					const existing = priceMap.get(item.TypeName);
					const buy = item.BuyValue || 0;
					const sell = item.SellValue || 0;

					if (!existing || existing.latestDate !== latestDate) {
						await this.prisma.goldPrice.upsert({
							where: {
								type: item.TypeName,
							},
							update: {
								buy,
								sell,
								latestDate,
							},
							create: {
								type: item.TypeName,
								buy,
								sell,
								latestDate,
							},
						});

						await this.prisma.goldPriceHistory.create({
							data: {
								type: item.TypeName,
								buy,
								sell,
								date: new Date(),
							},
						});
						updatedCount++;
					}
				}

				if (updatedCount > 0) {
					this.logger.log(
						`Đã cập nhật ${updatedCount} loại vàng có thay đổi (Thời điểm: ${latestDate}).`,
					);
				}

				return { success: true, count: updatedCount };
			}
		} catch (error) {
			this.logger.error("Lỗi khi fetch giá vàng SJC:", error.message);
			return { success: false, error: error.message };
		}
	}
}
