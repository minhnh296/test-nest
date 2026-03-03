import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentBranch = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		// Giá trị này được Inject từ BranchMiddleware lúc nãy
		return request.currentBranchId;
	},
);
