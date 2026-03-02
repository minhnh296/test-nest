import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MinLength,
} from "class-validator";

export class CreateUserDto {
	@ApiProperty({ example: "User", description: "Tên đăng nhập mới" })
	@IsString()
	@IsNotEmpty({ message: "Tên đăng nhập không được để trống" })
	username!: string;

	@ApiProperty({
		example: "User@123",
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
	password!: string;

	@ApiProperty({
		example: "user@kimthanh.com",
		description: "Email người dùng",
	})
	@IsNotEmpty({ message: "Email không được để trống" })
	@IsString()
	@Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
		message: "Email không đúng định dạng",
	})
	email!: string;

	@ApiPropertyOptional({
		example: "http://example.com",
		description: "Đăng ký ảnh đại diện",
	})
	@IsString()
	@IsOptional()
	avatar?: string;

	@ApiPropertyOptional({ example: "Nguyễn User", description: "Đăng ký tên" })
	@IsString()
	@IsOptional()
	fullName?: string;

	@ApiPropertyOptional({ example: 2, description: "ID của Role" })
	@IsOptional()
	roleId?: number;

	@ApiPropertyOptional({ example: 2, description: "ID của Chi nhánh" })
	@IsOptional()
	branchId?: number;
}
