import {
	Injectable,
	BadRequestException,
	ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.services";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { CreatePermissionDto } from "./dto/create-permission.dto";

@Injectable()
export class RoleService {
	constructor(private readonly prisma: PrismaService) {}

	async create(createRoleDto: CreateRoleDto) {
		const { permissionIds, ...roleData } = createRoleDto;
		const normalizedName = roleData.name.trim().toUpperCase();

		const existing = await this.prisma.role.findUnique({
			where: { name: normalizedName },
		});
		if (existing) {
			throw new ConflictException(`Role với tên ${normalizedName} đã tồn tại`);
		}

		if (permissionIds?.length) {
			await this.validatePermissions(permissionIds);
		}

		const role = await this.prisma.role.create({
			data: {
				...roleData,
				name: normalizedName,
				permissions: permissionIds?.length
					? {
							create: permissionIds.map((permissionId) => ({
								permission: { connect: { id: permissionId } },
							})),
						}
					: undefined,
			},
			include: {
				permissions: {
					include: { permission: true },
				},
			},
		});

		return {
			...role,
			permissions: role.permissions.map((p) => p.permission),
		};
	}

	async findAll() {
		const roles = await this.prisma.role.findMany({
			orderBy: { id: "asc" },
			include: {
				permissions: {
					include: { permission: true },
				},
			},
		});

		return roles.map((role) => ({
			...role,
			permissions: role.permissions.map((p) => p.permission),
		}));
	}

	async findOne(id: number) {
		const role = await this.prisma.role.findUnique({
			where: { id },
			include: {
				permissions: {
					include: { permission: true },
				},
			},
		});
		if (!role) {
			throw new BadRequestException(`Role với ID #${id} không tồn tại`);
		}
		return {
			...role,
			permissions: role.permissions.map((p) => p.permission),
		};
	}

	async update(id: number, updateRoleDto: UpdateRoleDto) {
		await this.findOne(id);

		const { permissionIds, ...roleData } = updateRoleDto;

		if (roleData.name) {
			const normalizedName = roleData.name.trim().toUpperCase();
			const conflict = await this.prisma.role.findFirst({
				where: { name: normalizedName, NOT: { id } },
			});
			if (conflict) {
				throw new ConflictException(
					`Role với tên ${normalizedName} đã tồn tại`,
				);
			}
			roleData.name = normalizedName;
		}

		if (permissionIds?.length) {
			await this.validatePermissions(permissionIds);
		}

		const role = await this.prisma.role.update({
			where: { id },
			data: {
				...roleData,
				...(permissionIds !== undefined && {
					permissions: {
						deleteMany: {},
						create: permissionIds.map((permissionId) => ({
							permission: { connect: { id: permissionId } },
						})),
					},
				}),
			},
			include: {
				permissions: {
					include: { permission: true },
				},
			},
		});

		return {
			...role,
			permissions: role.permissions.map((p) => p.permission),
		};
	}

	async remove(id: number) {
		await this.findOne(id);
		return this.prisma.role.delete({
			where: { id },
		});
	}

	async assignPermissions(id: number, permissionIds: number[]) {
		await this.findOne(id);

		if (permissionIds?.length) {
			await this.validatePermissions(permissionIds);
		}

		await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
		const role = await this.prisma.role.update({
			where: { id },
			data: {
				permissions: {
					create: permissionIds.map((permissionId) => ({
						permission: { connect: { id: permissionId } },
					})),
				},
			},
			include: {
				permissions: {
					include: { permission: true },
				},
			},
		});

		return {
			...role,
			permissions: role.permissions.map((p) => p.permission),
		};
	}

	async createPermission(createPermissionDto: CreatePermissionDto) {
		const normalizedName = createPermissionDto.name.trim().toUpperCase();

		const existing = await this.prisma.permission.findUnique({
			where: { name: normalizedName },
		});
		if (existing) {
			throw new ConflictException(
				`Permission với tên ${normalizedName} đã tồn tại`,
			);
		}
		return this.prisma.permission.create({
			data: {
				...createPermissionDto,
				name: normalizedName,
			},
		});
	}

	async findAllPermissions() {
		return this.prisma.permission.findMany({
			orderBy: { id: "asc" },
		});
	}

	async removePermission(id: number) {
		const permission = await this.prisma.permission.findUnique({
			where: { id },
		});
		if (!permission) {
			throw new BadRequestException(`Permission với ID ${id} không tồn tại`);
		}
		return this.prisma.permission.delete({
			where: { id },
		});
	}

	private async validatePermissions(permissionIds: number[]) {
		const existingPermissions = await this.prisma.permission.findMany({
			where: { id: { in: permissionIds } },
			select: { id: true },
		});

		const existingIds = existingPermissions.map((p) => p.id);
		const missingIds = permissionIds.filter((id) => !existingIds.includes(id));

		if (missingIds.length > 0) {
			throw new BadRequestException(
				`Permission ID ${missingIds.join(", ")} không tồn tại trong hệ thống`,
			);
		}
	}

	async assignRoleToUser(userId: string, roleId: number) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			throw new BadRequestException(`User với ID ${userId} không tồn tại`);
		}

		const role = await this.prisma.role.findUnique({ where: { id: roleId } });
		if (!role) {
			throw new BadRequestException(`Role với ID ${roleId} không tồn tại`);
		}

		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: { roleId },
			include: { role: true },
		});

		const { password, ...rest } = updatedUser;
		return rest;
	}
}
