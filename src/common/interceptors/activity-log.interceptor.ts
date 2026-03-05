import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { PrismaService } from "../../prisma.services";
import { LogAction, Prisma } from "@prisma/client";

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
	constructor(private readonly prisma: PrismaService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest();
		const { method, url } = request;

		if (["POST", "PATCH", "DELETE"].includes(method)) {
			return next.handle().pipe(
				tap(async (data) => {
					try {
						const moduleName = url.split("/")[1] || "System";
						let action: LogAction = LogAction.CREATE;

						if (method === "PATCH") action = LogAction.UPDATE;
						if (method === "DELETE") action = LogAction.DELETE;

						if (url.includes("/auth/login")) {
							action = LogAction.LOGIN;
						} else if (url.includes("/auth/logout")) {
							action = LogAction.LOGOUT;
						}
						const userId = request.user?.id || data?.userId || data?.user?.id;

						if (!userId) return;

						await this.prisma.activityLog.create({
							data: {
								userId: Number(userId),
								action,
								module:
									moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
								targetId: data?.id ? Number(data.id) : null,
								details: {
									url,
									method,
								} as Prisma.InputJsonValue,
							},
						});
					} catch (error) {
						console.error("Lỗi khi ghi Activity Log:", error);
					}
				}),
			);
		}

		return next.handle();
	}
}
