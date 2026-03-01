import {
	Injectable,
	NotFoundException,
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

		return this.prisma.role.create({
			data: {
				...roleData,
				name: normalizedName,
				permissions: permissionIds?.length
					? {
							create: permissionIds.map((permissionId) => ({ permissionId })),
						}
					: undefined,
			},
			include: {
				permissions: {
					include: { permission: true },
				},
			},
		});
	}

	async findAll() {
		return this.prisma.role.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				permissions: {
					include: { permission: true },
				},
			},
		});
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
			throw new NotFoundException(`Role với ID #${id} không tồn tại`);
		}
		return role;
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

		return this.prisma.role.update({
			where: { id },
			data: {
				...roleData,
				...(permissionIds !== undefined && {
					permissions: {
						deleteMany: {},
						create: permissionIds.map((permissionId) => ({ permissionId })),
					},
				}),
			},
			include: {
				permissions: {
					include: { permission: true },
				},
			},
		});
	}

	async remove(id: number) {
		await this.findOne(id);
		return this.prisma.role.delete({
			where: { id },
		});
	}

	async assignPermissions(id: number, permissionIds: number[]) {
		await this.findOne(id);
		await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
		return this.prisma.role.update({
			where: { id },
			data: {
				permissions: {
					create: permissionIds.map((permissionId) => ({ permissionId })),
				},
			},
			include: {
				permissions: {
					include: { permission: true },
				},
			},
		});
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
			orderBy: { name: "asc" },
		});
	}

	async removePermission(id: number) {
		const permission = await this.prisma.permission.findUnique({
			where: { id },
		});
		if (!permission) {
			throw new NotFoundException(`Permission với ID #${id} không tồn tại`);
		}
		return this.prisma.permission.delete({
			where: { id },
		});
	}
}
