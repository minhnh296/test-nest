import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class SignUpDto {
	@ApiProperty({ example: "newuser", description: "Tên đăng nhập mới" })
	@IsString()
	@IsNotEmpty({ message: "Tên đăng nhập không được để trống" })
	username: string;

	@ApiProperty({
		example: "Password123!",
		description:
			"Mật khẩu (ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt)",
	})
	@IsString()
	@MinLength(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
	@Matches(/^(?=.*[A-Z])/, {
		message: "Mật khẩu phải có ít nhất 1 chữ cái viết hoa",
	})
	@Matches(/^(?=.*\d)/, { message: "Mật khẩu phải có ít nhất 1 chữ số" })
	@Matches(/^(?=.*[!@#$%^&*(),.?":{}|<>])/, {
		message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
	})
	password: string;
}
