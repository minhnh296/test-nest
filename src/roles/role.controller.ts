import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { IsArray, IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class AssignPermissionsDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: "Danh sách ID permissions",
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}

@ApiTags("Roles")
@ApiBearerAuth()
@Controller("role")
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @ApiOperation({ summary: "Tạo role mới" })
  @ApiResponse({ status: 201, description: "Tạo role thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
  @ApiResponse({ status: 409, description: "Tên role đã tồn tại" })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách tất cả role" })
  @ApiResponse({ status: 200, description: "Thành công" })
  findAll() {
    return this.roleService.findAll();
  }

  @Post("permission")
  @ApiOperation({ summary: "Tạo permission mới" })
  @ApiResponse({ status: 201, description: "Tạo permission thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
  @ApiResponse({ status: 409, description: "Tên permission đã tồn tại" })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.roleService.createPermission(createPermissionDto);
  }

  @Get("permission")
  @ApiOperation({ summary: "Lấy danh sách tất cả permission" })
  @ApiResponse({ status: 200, description: "Thành công" })
  findAllPermissions() {
    return this.roleService.findAllPermissions();
  }

  @Delete("permission/:id")
  @ApiOperation({ summary: "Xóa permission" })
  @ApiResponse({ status: 200, description: "Xóa permission thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy permission" })
  removePermission(@Param("id") id: string) {
    return this.roleService.removePermission(+id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin chi tiết role" })
  @ApiResponse({ status: 200, description: "Thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy role" })
  findOne(@Param("id") id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật thông tin role" })
  @ApiResponse({ status: 200, description: "Cập nhật role thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
  @ApiResponse({ status: 404, description: "Không tìm thấy role" })
  @ApiResponse({ status: 409, description: "Tên role đã tồn tại" })
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa role" })
  @ApiResponse({ status: 200, description: "Xóa role thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy role để xóa" })
  remove(@Param("id") id: string) {
    return this.roleService.remove(+id);
  }

  @Put(":id/permissions")
  @ApiOperation({ summary: "Gán danh sách permissions cho role" })
  @ApiResponse({ status: 200, description: "Gán permissions thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy role" })
  @ApiBody({ type: AssignPermissionsDto })
  assignPermissions(
    @Param("id") id: string,
    @Body() body: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissions(+id, body.permissionIds);
  }
}
