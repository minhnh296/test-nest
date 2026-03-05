import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma.services";
import { CreateAccountingAccountDto } from "./dto/create-accounting-account.dto";
import { UpdateAccountingAccountDto } from "./dto/update-accounting-account.dto";

@Injectable()
export class AccountingAccountService {
	constructor(private readonly prisma: PrismaService) {}

	async create(createAccountingAccountDto: CreateAccountingAccountDto) {
		const { parentId, ...rest } = createAccountingAccountDto;

		if (parentId) {
			const parentAccount = await this.prisma.accountingAccount.findUnique({
				where: { id: parentId },
			});
			if (!parentAccount) {
				throw new BadRequestException(
					`Không tìm thấy tài khoản cha với ID ${parentId}`,
				);
			}
		}

		return this.prisma.accountingAccount.create({
			data: {
				...rest,
				...(parentId ? { parent: { connect: { id: parentId } } } : {}),
			},
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
		const limit = queryLimit || pageSize || 1000;
		const skip = (page - 1) * limit;

		const whereClause: import("@prisma/client").Prisma.AccountingAccountWhereInput =
			{};

		if (search) {
			whereClause.OR = [
				{
					name: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					accountNumber: {
						contains: search,
						mode: "insensitive",
					},
				},
			];
		}

		const [items, total] = await Promise.all([
			this.prisma.accountingAccount.findMany({
				where: whereClause,
				include: {
					children: true,
				},
				orderBy: {
					accountNumber: "asc",
				},
				skip,
				take: Number(limit),
			}),
			this.prisma.accountingAccount.count({ where: whereClause }),
		]);

		return {
			items,
			total,
			page: Number(page),
			pageSize: Math.ceil(total / limit),
		};
	}

	async findOne(id: number) {
		const account = await this.prisma.accountingAccount.findUnique({
			where: { id },
			include: {
				children: true,
				parent: true,
			},
		});

		if (!account) {
			throw new BadRequestException(`Không tìm thấy tài khoản với ID ${id}`);
		}

		return account;
	}

	async update(
		id: number,
		updateAccountingAccountDto: UpdateAccountingAccountDto,
	) {
		return this.prisma.accountingAccount.update({
			where: { id },
			data: {
				...updateAccountingAccountDto,
			},
		});
	}

	async remove(id: number) {
		return this.prisma.accountingAccount.delete({
			where: { id },
		});
	}
}
