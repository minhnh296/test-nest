import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { BranchesService } from "./branch.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Permissions } from "../roles/decorators/permissions.decorator";
import { BranchGuard } from "./guards/branch.guard";

@ApiTags("Branches")
@ApiBearerAuth()
@UseGuards(BranchGuard)
@Controller("branch")
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Permissions("BRANCH_CREATE")
  @Post()
  @ApiOperation({ summary: "Tạo chi nhánh mới" })
  @ApiResponse({ status: 201, description: "Tạo chi nhánh thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Permissions("BRANCH_VIEW")
  @Get()
  @ApiOperation({ summary: "Lấy danh sách tất cả chi nhánh" })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Thành công" })
  findAll(
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("pageSize") pageSize?: number,
  ) {
    return this.branchesService.findAll({ search, page, limit, pageSize });
  }

  @Permissions("BRANCH_VIEW")
  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin chi tiết chi nhánh" })
  @ApiResponse({ status: 200, description: "Thành công" })
  @ApiResponse({ status: 400, description: "Không tìm thấy chi nhánh" })
  findOne(@Param("id") id: string) {
    return this.branchesService.findOne(id);
  }

  @Permissions("BRANCH_EDIT")
  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật thông tin chi nhánh" })
  @ApiResponse({ status: 200, description: "Cập nhật chi nhánh thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
  @ApiResponse({ status: 400, description: "Không tìm thấy chi nhánh" })
  update(@Param("id") id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchesService.update(id, updateBranchDto);
  }

  @Permissions("BRANCH_DELETE")
  @Delete(":id")
  @ApiOperation({ summary: "Xóa chi nhánh" })
  @ApiResponse({ status: 200, description: "Xóa chi nhánh thành công" })
  @ApiResponse({ status: 400, description: "Không tìm thấy chi nhánh để xóa" })
  remove(@Param("id") id: string) {
    return this.branchesService.remove(id);
  }
}
