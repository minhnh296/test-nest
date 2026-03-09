import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException("Bạn chưa đăng nhập");
    }

    if (user.isSuperAdmin === true) {
      return true;
    }

    if (!user.role) {
      throw new ForbiddenException("Bạn không có quyền thao tác tính năng này");
    }

    const hasRole = requiredRoles.some(
      (role) => user.role?.toLowerCase() === role.toLowerCase(),
    );

    if (!hasRole) {
      throw new ForbiddenException("Bạn không có quyền thao tác tính năng này");
    }

    return true;
  }
}
