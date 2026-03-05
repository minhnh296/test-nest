import { Injectable, BadRequestException } from "@nestjs/common";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { PrismaService } from "../prisma.services";

@Injectable()
export class BranchesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(createBranchDto: CreateBranchDto) {
		return this.prisma.branch.create({
			data: createBranchDto,
		});
	}

	async findAll(
		query: {
			search?: string;
			page?: number;
			limit?: number;
			pageSize?: number;
		} = {},
	) {
		const { page = 1, limit: queryLimit, pageSize, search } = query;
		const limit = queryLimit || pageSize || 100;
		const skip = (page - 1) * limit;

		const whereClause: import("@prisma/client").Prisma.BranchWhereInput = {
			deletedAt: null,
		};

		if (search) {
			whereClause.name = {
				contains: search,
				mode: "insensitive",
			};
		}

		const [items, total] = await Promise.all([
			this.prisma.branch.findMany({
				where: whereClause,
				skip,
				take: Number(limit),
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.branch.count({ where: whereClause }),
		]);

		return {
			items,
			total,
			page: Number(page),
			pageSize: Math.ceil(total / limit),
		};
	}

	async findOne(id: number) {
		const branch = await this.prisma.branch.findFirst({
			where: { id, deletedAt: null },
		});
		if (!branch) {
			throw new BadRequestException(`Chi nhánh với ID #${id} không tồn tại`);
		}
		return branch;
	}

	async update(id: number, updateBranchDto: UpdateBranchDto) {
		await this.findOne(id);
		return this.prisma.branch.update({
			where: { id },
			data: updateBranchDto,
		});
	}

	async remove(id: number) {
		await this.findOne(id);
		return this.prisma.branch.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
