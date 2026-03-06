import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
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

						await this.prisma.activityLog.create({
							data: {
								userId: userId ? String(userId) : null,
								action,
								isSuccess: true,
								module:
									moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
								details: {
									url,
									ip: request.ip,
								} as Prisma.InputJsonValue,
							},
						});
					} catch (error) {
						console.error("Lỗi khi ghi Activity Log:", error);
					}
				}),
				catchError((error) => {
					const moduleName = url.split("/")[1] || "System";
					const userId = request.user?.id;

					this.prisma.activityLog
						.create({
							data: {
								action: url.includes("/auth/login")
									? LogAction.LOGIN
									: method === "PATCH"
										? LogAction.UPDATE
										: method === "DELETE"
											? LogAction.DELETE
											: LogAction.CREATE,
								isSuccess: false,
								module:
									moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
								userId: userId ? String(userId) : null,
								details: {
									url,
									ip: request.ip,
								} as Prisma.InputJsonValue,
							},
						})
						.catch((e) => console.error("Lỗi ghi log thất bại:", e));

					return throwError(() => error);
				}),
			);
		}

		return next.handle();
	}
}
