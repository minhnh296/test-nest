import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.services";

@Injectable()
export class UserGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		const targetUserId = request.params.id;

		if (!targetUserId || targetUserId === "undefined") return true;
		const targetUser = await this.prisma.user.findUnique({
			where: { id: targetUserId },
			include: { role: true },
		});

		if (!targetUser) {
			throw new BadRequestException(
				`Người dùng với ID #${targetUserId} không tồn tại`,
			);
		}

		const currentUser = await this.prisma.user.findUnique({
			where: { id: user?.id },
		});

		if (!currentUser) {
			throw new ForbiddenException("Không xác định được người dùng hiện tại");
		}

		if (user?.role?.toLowerCase() === "admin") return true;

		if (user?.role?.toLowerCase() === "manager") {
			if (targetUser.branchId !== currentUser.branchId) {
				throw new ForbiddenException(
					"Bạn chỉ được quản lý người dùng trong chi nhánh của mình",
				);
			}
			return true;
		}

		if (user?.id !== targetUserId) {
			throw new ForbiddenException(
				"Bạn không có quyền thao tác với tài khoản này",
			);
		}

		return true;
	}
}
