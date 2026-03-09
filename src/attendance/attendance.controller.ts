import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AttendanceService } from "./attendance.service";
import { CheckInDto } from "./dto/check-in.dto";
import { CheckOutDto } from "./dto/check-out.dto";
import { QueryAttendanceDto } from "./dto/query-attendance.dto";
import { Permissions } from "../roles/decorators/permissions.decorator";

@ApiTags("Attendance")
@ApiBearerAuth()
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("check-in")
  @ApiOperation({
    summary: "Chấm công vào",
    description: "Nhân viên chấm công vào ca làm việc",
  })
  @ApiResponse({ status: 201, description: "Chấm công vào thành công" })
  @ApiResponse({ status: 400, description: "Đã chấm công vào rồi" })
  checkIn(@Request() req, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(req.user.id, dto);
  }

  @Post("check-out")
  @ApiOperation({
    summary: "Chấm công ra",
    description: "Nhân viên chấm công ra kết thúc ca",
  })
  @ApiResponse({ status: 201, description: "Chấm công ra thành công" })
  @ApiResponse({
    status: 400,
    description: "Chưa check-in hoặc đã check-out rồi",
  })
  checkOut(@Request() req, @Body() dto: CheckOutDto) {
    return this.attendanceService.checkOut(req.user.id, dto);
  }

  @Get("today")
  @ApiOperation({
    summary: "Trạng thái chấm công hôm nay của bản thân",
    description:
      "Lấy trạng thái chấm công hôm nay của nhân viên đang đăng nhập.",
  })
  @ApiResponse({ status: 200, description: "Thành công" })
  getTodayStatus(@Request() req) {
    return this.attendanceService.getTodayStatus(req.user.id);
  }

  @Get()
  @Permissions("HRM_VIEW")
  @ApiOperation({
    summary: "Xem lịch sử chấm công",
  })
  @ApiResponse({ status: 200, description: "Thành công" })
  findAll(@Request() req, @Query() query: QueryAttendanceDto) {
    return this.attendanceService.findAll(req.user, query);
  }

  @Get(":id")
  @Permissions("HRM_VIEW")
  @ApiOperation({
    summary: "Xem chi tiết một bản ghi chấm công",
  })
  @ApiResponse({ status: 200, description: "Thành công" })
  @ApiResponse({ status: 400, description: "Không tìm thấy bản ghi" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.attendanceService.findOne(id, req.user);
  }
}
