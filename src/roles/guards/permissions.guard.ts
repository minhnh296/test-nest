import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { PrismaService } from "../../prisma.services";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException("Bạn chưa đăng nhập");
    }

    if (user.isSuperAdmin === true) {
      return true;
    }

    if (!user.roleId) {
      throw new ForbiddenException("Bạn không có quyền thao tác tính năng này");
    }

    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new ForbiddenException("Bạn không có quyền thao tác tính năng này");
    }

    const userPermissions = role.permissions.map((p) =>
      p.permission.name.toUpperCase(),
    );

    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm.toUpperCase()),
    );

    if (!hasPermission) {
      throw new ForbiddenException("Bạn không có quyền thao tác tính năng này");
    }

    return true;
  }
}
