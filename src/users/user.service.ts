import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "../prisma.services";

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async findOne(username: string) {
		return this.prisma.user.findUnique({
			where: { username },
		});
	}

	async create(createUserDto: CreateUserDto) {
		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
		return this.prisma.user.create({
			data: {
				username: createUserDto.username,
				password: hashedPassword,
			},
		});
	}

	async findAll() {
		return this.prisma.user.findMany();
	}

	async findById(id: number) {
		return this.prisma.user.findUnique({
			where: { id },
		});
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
