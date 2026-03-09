import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Permissions } from "../roles/decorators/permissions.decorator";
import { AccountingAccountService } from "./accounting-account.service";
import { CreateAccountingAccountDto } from "./dto/create-accounting-account.dto";
import { UpdateAccountingAccountDto } from "./dto/update-accounting-account.dto";

@ApiTags("Accounting account")
@ApiBearerAuth()
@Controller("accounting-account")
export class AccountingAccountController {
  constructor(
    private readonly accountingAccountService: AccountingAccountService,
  ) {}

  @Post()
  @Permissions("ACCOUNTING_CREATE")
  @ApiOperation({ summary: "Tạo tài khoản kế toán mới" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  create(@Body() createAccountingAccountDto: CreateAccountingAccountDto) {
    return this.accountingAccountService.create(createAccountingAccountDto);
  }

  @Get()
  @Permissions("ACCOUNTING_VIEW")
  @ApiOperation({ summary: "Lấy danh sách tất cả tài khoản kế toán" })
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
    return this.accountingAccountService.findAll({
      search,
      page,
      limit,
      pageSize,
    });
  }

  @Get(":id")
  @Permissions("ACCOUNTING_VIEW")
  @ApiOperation({ summary: "Lấy thông tin chi tiết một tài khoản" })
  @ApiResponse({ status: 200, description: "Thành công" })
  @ApiResponse({ status: 400, description: "Không tìm thấy" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.accountingAccountService.findOne(id);
  }

  @Patch(":id")
  @Permissions("ACCOUNTING_EDIT")
  @ApiOperation({ summary: "Cập nhật tài khoản kế toán" })
  @ApiResponse({ status: 200, description: "Cập nhật thành công" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAccountingAccountDto: UpdateAccountingAccountDto,
  ) {
    return this.accountingAccountService.update(id, updateAccountingAccountDto);
  }

  @Delete(":id")
  @Permissions("ACCOUNTING_EDIT")
  @ApiOperation({ summary: "Xóa tài khoản kế toán" })
  @ApiResponse({ status: 200, description: "Xóa thành công" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.accountingAccountService.remove(id);
  }
}
