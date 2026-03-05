import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "../prisma.services";

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async findOne(username: string) {
		return this.prisma.user.findFirst({
			where: {
				OR: [{ username }, { email: username }],
			},
			include: {
				branch: true,
				role: true,
			},
		});
	}

	async create(createUserDto: CreateUserDto) {
		const { password, ...userData } = createUserDto;
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await this.prisma.user.create({
			data: {
				...userData,
				password: hashedPassword,
			},
			include: {
				branch: true,
				role: true,
			},
		});
		const { password: _pw, isSuperAdmin: _isa, ...rest } = user;
		return {
			...rest,
			branch: user.branch?.name,
			role: user.role?.name,
		};
	}

	async findAll(
		currentUser?: {
			id: number;
			role: string;
			isSuperAdmin: boolean;
		},
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

		const whereClause: import("@prisma/client").Prisma.UserWhereInput = {};

		if (currentUser?.role !== "ADMIN" && !currentUser?.isSuperAdmin) {
			whereClause.isSuperAdmin = false;
			whereClause.role = {
				is: {
					name: {
						notIn: ["ADMIN", "MANAGER"],
					},
				},
			};
		}

		if (search) {
			whereClause.username = {
				contains: search,
				mode: "insensitive",
			};
		}

		const [users, total] = await Promise.all([
			this.prisma.user.findMany({
				where: whereClause,
				include: {
					branch: true,
					role: true,
				},
				skip,
				take: Number(limit),
			}),
			this.prisma.user.count({ where: whereClause }),
		]);

		const items = users.map(
			({
				password,
				isSuperAdmin,
				branch,
				role,
				branchId,
				roleId,
				...user
			}) => ({
				...user,
				branch: branch?.name,
				role: role?.name,
			}),
		);

		return {
			items,
			total,
			page: Number(page),
			pageSize: Math.ceil(total / limit),
		};
	}

	async findById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				branch: true,
				role: true,
			},
		});
		if (!user) return null;
		const { password, isSuperAdmin, branch, role, branchId, roleId, ...rest } =
			user;
		return {
			...rest,
			branch: branch?.name,
			role: role?.name,
		};
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		const { password: rawPassword, ...userData } = updateUserDto;
		const hashedPassword = rawPassword
			? await bcrypt.hash(rawPassword, 10)
			: undefined;

		if ("branchId" in userData) {
			userData.branchId = userData.branchId
				? Number(userData.branchId)
				: (null as unknown as number);
		}
		if ("roleId" in userData) {
			userData.roleId = userData.roleId
				? Number(userData.roleId)
				: (null as unknown as number);
		}

		const user = await this.prisma.user.update({
			where: { id },
			data: {
				...userData,
				...(hashedPassword ? { password: hashedPassword } : {}),
			},
			include: {
				branch: true,
				role: true,
			},
		});

		const { password: _pw, isSuperAdmin: _isa, ...rest } = user;
		return {
			...rest,
			branch: user.branch?.name,
			role: user.role?.name,
		};
	}

	async remove(id: number) {
		return this.prisma.user.delete({
			where: { id },
		});
	}
}
