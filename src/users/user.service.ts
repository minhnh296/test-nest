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
		const { password: _, ...rest } = user;
		return {
			...rest,
			branch: user.branch?.name,
			role: user.role?.name,
		};
	}

	async findAll() {
		const users = await this.prisma.user.findMany({
			include: {
				branch: true,
				role: true,
			},
		});
		return users.map(
			({ password, branch, role, branchId, roleId, ...user }) => ({
				...user,
				branch: branch?.name,
				role: role?.name,
			}),
		);
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
		const { password, branch, role, branchId, roleId, ...rest } = user;
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

		const { password: _, ...rest } = user;
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
