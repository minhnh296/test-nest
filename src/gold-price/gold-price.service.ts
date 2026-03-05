import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Cron, CronExpression } from "@nestjs/schedule";
import { firstValueFrom } from "rxjs";
import { PrismaService } from "../prisma.services";
import { CreateGoldPriceDto } from "./dto/create-gold-price.dto";
import { UpdateGoldPriceDto } from "./dto/update-gold-price.dto";

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

	@Cron(CronExpression.EVERY_HOUR)
	async handleCron() {
		await this.syncSjcPrices();
	}

	async getPricesFromDb() {
		return this.prisma.goldPrice.findMany({
			distinct: ["type"],
			orderBy: [{ id: "asc" }],
		});
	}

	async getHistory(query: {
		type?: string;
		from?: string;
		to?: string;
		limit?: number;
	}) {
		const { type, from, to, limit = 100 } = query;

		const where: import("@prisma/client").Prisma.GoldPriceWhereInput = {};
		if (type) where.type = type;
		if (from || to) {
			where.createdAt = {
				gte: from ? new Date(from) : undefined,
				lte: to ? new Date(to) : undefined,
			};
		}

		return this.prisma.goldPrice.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: Number(limit),
		});
	}

	async findOne(id: number) {
		return this.prisma.goldPrice.findUnique({
			where: { id },
		});
	}

	async create(data: CreateGoldPriceDto) {
		return this.prisma.goldPrice.create({
			data: {
				type: data.type,
				buy: data.buy,
				sell: data.sell,
				latestDate: new Date().toISOString(),
			},
		});
	}

	async update(id: number, data: UpdateGoldPriceDto) {
		return this.prisma.goldPrice.update({
			where: { id },
			data: {
				...data,
				latestDate: new Date().toISOString(),
			},
		});
	}

	async remove(id: number) {
		return this.prisma.goldPrice.delete({
			where: { id },
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
				const currentPrices = await this.getPricesFromDb();
				const priceMap = new Map(currentPrices.map((p) => [p.type, p]));

				let updatedCount = 0;

				for (const item of data) {
					const existing = priceMap.get(item.TypeName);
					const buy = item.BuyValue || 0;
					const sell = item.SellValue || 0;

					if (!existing || existing.latestDate !== latestDate) {
						await this.prisma.goldPrice.create({
							data: {
								type: item.TypeName,
								buy,
								sell,
								latestDate,
							},
						});
						updatedCount++;
					}
				}

				if (updatedCount > 0) {
					this.logger.log(
						`Đã lưu thêm ${updatedCount} bản ghi giá vàng mới (Thời điểm: ${latestDate}).`,
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
