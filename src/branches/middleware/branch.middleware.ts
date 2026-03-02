// d:\ProjectTQA\kim-thanh-be\src\branches\middleware\branch.middleware.ts

import {
	Injectable,
	NestMiddleware,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60000;

@Injectable()
export class BranchMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const ip = req.ip || "unknown";
		const now = Date.now();

		const record = rateLimitMap.get(ip);

		if (!record || now > record.resetTime) {
			rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		} else {
			record.count++;
			if (record.count > RATE_LIMIT_MAX) {
				const retryAfter = Math.ceil((record.resetTime - now) / 1000);
				res.setHeader("Retry-After", retryAfter);
				throw new HttpException(
					`Quá nhiều request. Vui lòng thử lại sau ${retryAfter} giây.`,
					HttpStatus.TOO_MANY_REQUESTS,
				);
			}
		}

		const requestId = `branch-${now}-${Math.random().toString(36).slice(2, 7)}`;
		req["requestId"] = requestId;
		res.setHeader("X-Request-Id", requestId);

		const { method, url } = req;
		const start = Date.now();

		res.on("finish", () => {
			const duration = Date.now() - start;
			const { statusCode } = res;

			let statusColor: string;
			if (statusCode >= 500) statusColor = "\x1b[31m";
			else if (statusCode >= 400) statusColor = "\x1b[33m";
			else if (statusCode >= 300) statusColor = "\x1b[36m";
			else statusColor = "\x1b[32m";

			const reset = "\x1b[0m";
			const dim = "\x1b[2m";
			const bold = "\x1b[1m";
			const slowWarning = duration > 500 ? " \x1b[33m⚠ SLOW\x1b[0m" : "";

			console.log(
				`${bold}[Branch]${reset} ${dim}${requestId}${reset} ` +
					`${bold}${method}${reset} ${url} → ` +
					`${statusColor}${bold}${statusCode}${reset} ` +
					`${dim}(${duration}ms)${reset}${slowWarning}`,
			);
		});

		next();
	}
}
