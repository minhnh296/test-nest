import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
	@ApiProperty({
		example: "admin",
		description: "Tên đăng nhập của người dùng",
	})
	@IsString()
	@IsNotEmpty({ message: "Tên đăng nhập không được để trống" })
	username: string;

	@ApiProperty({
		example: "Password123!",
		description: "Mật khẩu của người dùng",
	})
	@IsString()
	@IsNotEmpty({ message: "Mật khẩu không được để trống" })
	password: string;
}
