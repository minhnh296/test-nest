import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class BranchMiddleware implements NestMiddleware {
	private readonly logger = new Logger(BranchMiddleware.name);

	use(req: Request, res: Response, next: NextFunction) {
		const { method, originalUrl, ip } = req;
		const startTime = Date.now();

		res.on("finish", () => {
			const duration = Date.now() - startTime;
			const { statusCode } = res;
			this.logger.log(
				`${method} ${originalUrl} | Status: ${statusCode} | IP: ${ip} | "N/A"} | ${duration}ms`,
			);
		});

		next();
	}
}
