import { Controller, Get, Query, Param } from "@nestjs/common";
import { ActivityLogService } from "./activity-log.service";
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiQuery,
} from "@nestjs/swagger";
import { LogAction } from "@prisma/client";

@ApiTags("Activity Logs")
@ApiBearerAuth()
@Controller("activity-logs")
export class ActivityLogController {
	constructor(private readonly activityLogService: ActivityLogService) {}

	@Get()
	@ApiOperation({
		summary: "Lấy danh sách nhật ký hoạt động (có phân trang và lọc)",
	})
	@ApiQuery({ name: "userId", required: false, type: String })
	@ApiQuery({ name: "action", required: false, enum: LogAction })
	@ApiQuery({ name: "module", required: false, type: String })
	@ApiQuery({
		name: "startDate",
		required: false,
		type: String,
		description: "YYYY-MM-DD",
	})
	@ApiQuery({
		name: "endDate",
		required: false,
		type: String,
		description: "YYYY-MM-DD",
	})
	@ApiQuery({ name: "page", required: false, type: Number, example: 1 })
	@ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
	@ApiResponse({ status: 200, description: "Thành công" })
	async findAll(
		@Query("userId") userId?: string,
		@Query("action") action?: LogAction,
		@Query("module") module?: string,
		@Query("startDate") startDate?: string,
		@Query("endDate") endDate?: string,
		@Query("page") page?: number,
		@Query("limit") limit?: number,
	) {
		return this.activityLogService.findAll({
			userId,
			action,
			module,
			startDate,
			endDate,
			page,
			limit,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Xem chi tiết một bản ghi nhật ký" })
	@ApiResponse({ status: 200, description: "Thành công" })
	@ApiResponse({ status: 404, description: "Không tìm thấy" })
	async findOne(@Param("id") id: string) {
		return this.activityLogService.findOne(id);
	}
}
