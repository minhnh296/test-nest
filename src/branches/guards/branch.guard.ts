import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.services";

@Injectable()
export class BranchGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		const branchId = request.params.id;

		if (!branchId || branchId === "undefined") return true;
		const branch = await this.prisma.branch.findFirst({
			where: { id: branchId, deletedAt: null },
		});

		if (!branch) {
			throw new BadRequestException(
				`Chi nhánh với ID #${branchId} không tồn tại`,
			);
		}
		if (user?.role?.toLowerCase() === "admin") return true;
		if (user?.branchId !== branchId) {
			throw new ForbiddenException(
				"Bạn không có quyền thao tác với chi nhánh này",
			);
		}

		return true;
	}
}
