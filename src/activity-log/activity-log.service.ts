import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.services";
import { LogAction } from "@prisma/client";

@Injectable()
export class ActivityLogService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(query: {
		userId?: string;
		action?: LogAction;
		module?: string;
		startDate?: string;
		endDate?: string;
		page?: number;
		limit?: number;
	}) {
		const {
			userId,
			action,
			module,
			startDate,
			endDate,
			page = 1,
			limit = 100,
		} = query;
		const skip = (page - 1) * limit;

		const where: import("@prisma/client").Prisma.ActivityLogWhereInput = {};
		if (userId) where.userId = userId;
		if (action) where.action = action;
		if (module) where.module = { contains: module, mode: "insensitive" };

		if (startDate || endDate) {
			const createdAt: import("@prisma/client").Prisma.DateTimeFilter = {};
			if (startDate) createdAt.gte = new Date(startDate);
			if (endDate) createdAt.lte = new Date(endDate);
			where.createdAt = createdAt;
		}

		const [items, total] = await Promise.all([
			this.prisma.activityLog.findMany({
				where,
				include: {
					user: {
						select: {
							username: true,
							fullName: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: Number(limit),
			}),
			this.prisma.activityLog.count({ where }),
		]);

		return {
			items,
			total,
			page: Number(page),
			pageSize: Math.ceil(total / limit),
		};
	}

	async findOne(id: string) {
		return this.prisma.activityLog.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						username: true,
						fullName: true,
					},
				},
			},
		});
	}
}
