import { Injectable, NotFoundException } from "@nestjs/common";
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
				throw new NotFoundException(
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

	async findAll() {
		return this.prisma.accountingAccount.findMany({
			include: {
				children: true,
			},
			orderBy: {
				accountNumber: "asc",
			},
		});
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
			throw new NotFoundException(`Không tìm thấy tài khoản với ID ${id}`);
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
