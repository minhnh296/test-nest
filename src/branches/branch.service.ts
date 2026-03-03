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

	async findAll() {
		return this.prisma.branch.findMany({
			where: { deletedAt: null },
			orderBy: { createdAt: "desc" },
		});
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
