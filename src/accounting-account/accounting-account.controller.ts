import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Roles } from "src/auth/roles.decorator";
import { AccountingAccountService } from "./accounting-account.service";
import { CreateAccountingAccountDto } from "./dto/create-accounting-account.dto";
import { UpdateAccountingAccountDto } from "./dto/update-accounting-account.dto";

@ApiTags("Hệ thống tài khoản")
@ApiBearerAuth()
@Controller("accounting-account")
export class AccountingAccountController {
	constructor(
		private readonly accountingAccountService: AccountingAccountService,
	) {}

	@Post()
	@Roles("admin")
	@ApiOperation({ summary: "Tạo tài khoản kế toán mới" })
	@ApiResponse({ status: 201, description: "Tạo thành công" })
	create(@Body() createAccountingAccountDto: CreateAccountingAccountDto) {
		return this.accountingAccountService.create(createAccountingAccountDto);
	}

	@Get()
	@ApiOperation({ summary: "Lấy danh sách tất cả tài khoản kế toán" })
	@ApiResponse({ status: 200, description: "Thành công" })
	findAll() {
		return this.accountingAccountService.findAll();
	}

	@Get(":id")
	@ApiOperation({ summary: "Lấy thông tin chi tiết một tài khoản" })
	@ApiResponse({ status: 200, description: "Thành công" })
	@ApiResponse({ status: 404, description: "Không tìm thấy" })
	findOne(@Param("id") id: string) {
		return this.accountingAccountService.findOne(+id);
	}

	@Patch(":id")
	@Roles("admin")
	@ApiOperation({ summary: "Cập nhật tài khoản kế toán" })
	@ApiResponse({ status: 200, description: "Cập nhật thành công" })
	update(
		@Param("id") id: string,
		@Body() updateAccountingAccountDto: UpdateAccountingAccountDto,
	) {
		return this.accountingAccountService.update(
			+id,
			updateAccountingAccountDto,
		);
	}

	@Delete(":id")
	@Roles("admin")
	@ApiOperation({ summary: "Xóa tài khoản kế toán" })
	@ApiResponse({ status: 200, description: "Xóa thành công" })
	remove(@Param("id") id: string) {
		return this.accountingAccountService.remove(+id);
	}
}
