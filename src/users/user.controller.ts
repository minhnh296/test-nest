import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./user.service";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Roles } from "src/auth/roles.decorator";

@ApiTags("Users")
@ApiBearerAuth()
@Roles("admin")
@Controller("user")
export class UsersController {
	constructor(private readonly userService: UsersService) {}

	@Post()
	@ApiOperation({ summary: "Tạo người dùng mới" })
	@ApiResponse({ status: 201, description: "Tạo người dùng thành công" })
	@ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	@Get()
	@ApiOperation({ summary: "Lấy danh sách tất cả người dùng" })
	@ApiResponse({ status: 200, description: "Thành công" })
	findAll() {
		return this.userService.findAll();
	}

	@Get(":id")
	@ApiOperation({ summary: "Lấy thông tin chi tiết người dùng" })
	@ApiResponse({ status: 200, description: "Thành công" })
	@ApiResponse({ status: 404, description: "Không tìm thấy người dùng" })
	findOne(@Param("id") id: string) {
		return this.userService.findById(+id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Cập nhật thông tin người dùng" })
	@ApiResponse({ status: 200, description: "Cập nhật người dùng thành công" })
	@ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
	@ApiResponse({ status: 404, description: "Không tìm thấy người dùng" })
	update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(+id, updateUserDto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Xóa người dùng" })
	@ApiResponse({ status: 200, description: "Xóa người dùng thành công" })
	@ApiResponse({ status: 404, description: "Không tìm thấy người dùng để xóa" })
	remove(@Param("id") id: string) {
		return this.userService.remove(+id);
	}
}
