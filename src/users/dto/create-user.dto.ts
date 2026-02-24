import { IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
	@IsString()
	username!: string;

	@IsString()
	@MinLength(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
	@Matches(/^(?=.*[A-Z])/, {
		message: "Mật khẩu phải có ít nhất 1 chữ cái viết hoa",
	})
	@Matches(/^(?=.*\d)/, { message: "Mật khẩu phải có ít nhất 1 chữ số" })
	@Matches(/^(?=.*[!@#$%^&*(),.?":{}|<>])/, {
		message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
	})
	password!: string;
}
