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
import { AssignRoleDto } from "./dto/assign-role.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Permissions } from "./decorators/permissions.decorator";
import { AssignPermissionsDto } from "./dto/assign-permissions.dto";

@ApiTags("Roles")
@ApiBearerAuth()
@Controller("role")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Permissions("ROLE_CREATE")
  @Post()
  @ApiOperation({ summary: "Tạo role mới" })
  @ApiResponse({ status: 201, description: "Tạo role thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
  @ApiResponse({ status: 409, description: "Tên role đã tồn tại" })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Permissions("ROLE_VIEW")
  @Get()
  @ApiOperation({ summary: "Lấy danh sách tất cả role" })
  @ApiResponse({ status: 200, description: "Thành công" })
  findAll() {
    return this.roleService.findAll();
  }

  @Permissions("ROLE_CREATE")
  @Post("permission")
  @ApiOperation({ summary: "Tạo permission mới" })
  @ApiResponse({ status: 201, description: "Tạo permission thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
  @ApiResponse({ status: 409, description: "Tên permission đã tồn tại" })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.roleService.createPermission(createPermissionDto);
  }

  @Permissions("ROLE_VIEW")
  @Get("permission")
  @ApiOperation({ summary: "Lấy danh sách tất cả permission" })
  @ApiResponse({ status: 200, description: "Thành công" })
  findAllPermissions() {
    return this.roleService.findAllPermissions();
  }

  @Permissions("ROLE_DELETE")
  @Delete("permission/:id")
  @ApiOperation({ summary: "Xóa permission" })
  @ApiResponse({ status: 200, description: "Xóa permission thành công" })
  @ApiResponse({ status: 400, description: "Không tìm thấy permission" })
  removePermission(@Param("id") id: number) {
    return this.roleService.removePermission(id);
  }

  @Permissions("ROLE_VIEW")
  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin chi tiết role" })
  @ApiResponse({ status: 200, description: "Thành công" })
  @ApiResponse({ status: 400, description: "Không tìm thấy role" })
  findOne(@Param("id") id: number) {
    return this.roleService.findOne(id);
  }

  @Permissions("ROLE_EDIT")
  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật thông tin role" })
  @ApiResponse({ status: 200, description: "Cập nhật role thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
  @ApiResponse({ status: 400, description: "Không tìm thấy role" })
  @ApiResponse({ status: 409, description: "Tên role đã tồn tại" })
  update(@Param("id") id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Permissions("ROLE_DELETE")
  @Delete(":id")
  @ApiOperation({ summary: "Xóa role" })
  @ApiResponse({ status: 200, description: "Xóa role thành công" })
  @ApiResponse({ status: 400, description: "Không tìm thấy role để xóa" })
  remove(@Param("id") id: number) {
    return this.roleService.remove(id);
  }

  @Permissions("ROLE_EDIT")
  @Put(":id/permissions")
  @ApiOperation({ summary: "Gán danh sách permissions cho role" })
  @ApiResponse({ status: 200, description: "Gán permissions thành công" })
  @ApiResponse({ status: 400, description: "Không tìm thấy role" })
  @ApiBody({ type: AssignPermissionsDto })
  assignPermissions(
    @Param("id") id: number,
    @Body() body: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissions(id, body.permissionIds);
  }

  @Post("assign-user")
  @Permissions("ROLE_MANAGE")
  @ApiOperation({ summary: "Gán Role cho User" })
  @ApiResponse({ status: 200, description: "Gán role thành công" })
  @ApiResponse({ status: 400, description: "Không tìm thấy User hoặc Role" })
  assignUser(@Body() body: AssignRoleDto) {
    return this.roleService.assignRoleToUser(body.userId, body.roleId);
  }
}
