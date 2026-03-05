import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
} from "@nestjs/common";
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from "@nestjs/swagger";
import { SettingService } from "./setting.service";
import { CreateSettingDto } from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";

@ApiTags("Settings")
@ApiBearerAuth()
@Controller("settings")
export class SettingController {
	constructor(private readonly settingService: SettingService) {}

	@Post()
	@ApiOperation({ summary: "Tạo mới một cấu hình" })
	@ApiResponse({ status: 201, description: "Tạo cấu hình thành công" })
	@ApiResponse({ status: 409, description: "Mã cấu hình đã tồn tại" })
	create(@Body() createSettingDto: CreateSettingDto) {
		return this.settingService.create(createSettingDto);
	}

	@Get()
	@ApiOperation({ summary: "Lấy danh sách tất cả cấu hình" })
	@ApiResponse({ status: 200, description: "Danh sách cấu hình" })
	findAll() {
		return this.settingService.findAll();
	}

	@Get(":id")
	@ApiOperation({ summary: "Lấy chi tiết một cấu hình theo ID" })
	@ApiResponse({ status: 200, description: "Chi tiết cấu hình" })
	@ApiResponse({ status: 404, description: "Không tìm thấy cấu hình" })
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.settingService.findOne(id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Cập nhật nội dung một cấu hình" })
	@ApiResponse({ status: 200, description: "Cập nhật cấu hình thành công" })
	@ApiResponse({ status: 404, description: "Không tìm thấy cấu hình" })
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateSettingDto: UpdateSettingDto,
	) {
		return this.settingService.update(id, updateSettingDto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Xóa một cấu hình" })
	@ApiResponse({ status: 200, description: "Xóa cấu hình thành công" })
	@ApiResponse({ status: 404, description: "Không tìm thấy cấu hình" })
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.settingService.remove(id);
	}
}
