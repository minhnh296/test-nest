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
		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
		return this.prisma.user.create({
			data: {
				username: createUserDto.username,
				password: hashedPassword,
				email: createUserDto.email,
			},
		});
	}

	async findAll() {
		const users = await this.prisma.user.findMany({
			include: {
				branch: true,
			},
		});
		return users.map(({ password, branch, ...user }) => ({
			...user,
			branch: branch?.name,
		}));
	}

	async findById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				branch: true,
			},
		});
		if (!user) return null;
		const { password, branch, ...rest } = user;
		return { ...rest, branch: branch?.name };
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		const hashedPassword = updateUserDto.password
			? await bcrypt.hash(updateUserDto.password, 10)
			: undefined;

		return this.prisma.user.update({
			where: { id },
			data: {
				...updateUserDto,
				...(hashedPassword ? { password: hashedPassword } : {}),
			},
		});
	}

	async remove(id: number) {
		return this.prisma.user.delete({
			where: { id },
		});
	}
}
