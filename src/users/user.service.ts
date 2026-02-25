import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";

export type User = {
	userId: number;
	username: string;
	password: string;
};

@Injectable()
export class UsersService {
	private readonly users = [
		{
			userId: 1,
			username: "Admin",
			password: bcrypt.hashSync("Admin@123", 10),
		},
		{
			userId: 2,
			username: "User",
			password: bcrypt.hashSync("User@123", 10),
		},
	];

	async findOne(username: string): Promise<User | undefined> {
		return this.users.find((user) => user.username === username);
	}

	async create(createUserDto: CreateUserDto) {
		const newUser = {
			userId: this.users.length + 1,
			username: createUserDto.username,
			password: bcrypt.hashSync(createUserDto.password, 10),
		};
		this.users.push(newUser);
		return newUser;
	}

	findAll() {
		return this.users;
	}

	findById(id: number) {
		return this.users.find((user) => user.userId === id);
	}

	update(id: number, updateUserDto: UpdateUserDto) {
		const userIndex = this.users.findIndex((user) => user.userId === id);
		if (userIndex === -1) return `User #${id} not found`;

		if (updateUserDto.password) {
			updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
		}

		this.users[userIndex] = { ...this.users[userIndex], ...updateUserDto };
		return this.users[userIndex];
	}

	remove(id: number) {
		const userIndex = this.users.findIndex((user) => user.userId === id);
		if (userIndex === -1) return `User #${id} not found`;

		const deletedUser = this.users[userIndex];
		this.users.splice(userIndex, 1);
		return deletedUser;
	}
}
