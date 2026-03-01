import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { SignInDto } from "./dto/signIn.dto";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/signUp.dto";
import { LocalAuthGuard } from "./local-auth-guard";
import { Public } from "./public.decorator";
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post("login")
	@ApiOperation({ summary: "Đăng nhập (Dùng được cả bằng username và email)" })
	@ApiBody({ type: SignInDto })
	@ApiResponse({ status: 200, description: "Đăng nhập thành công" })
	@ApiResponse({
		status: 401,
		description: "Tài khoản hoặc mật khẩu không chính xác",
	})
	signIn(@Request() req) {
		return req.user;
	}

	@ApiBearerAuth()
	@Post("logout")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Đăng xuất" })
	@ApiResponse({ status: 200, description: "Đăng xuất thành công" })
	signOut(@Request() req) {
		const token = req.headers.authorization?.split(" ")[1];
		return this.authService.signOut(token);
	}

	@Public()
	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Đăng ký" })
	@ApiResponse({ status: 201, description: "Tạo tài khoản thành công" })
	@ApiResponse({ status: 400, description: "Dữ liệu đầu vào không hợp lệ" })
	async signUp(@Body() signUpDto: SignUpDto) {
		return this.authService.signUp(
			signUpDto.username,
			signUpDto.password,
			signUpDto.email,
		);
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	@Get("profile")
	@ApiOperation({ summary: "getMe" })
	@ApiResponse({ status: 200, description: "Thành công" })
	@ApiResponse({
		status: 401,
		description: "Token không hợp lệ hoặc không có quyền truy cập",
	})
	getProfile(@Request() req) {
		return this.authService.getProfile(req.user.id);
	}
}
