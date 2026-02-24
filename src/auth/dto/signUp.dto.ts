import { IsString, Matches, MinLength, IsNotEmpty } from "class-validator";

export class SignUpDto {
  @IsString()
  @IsNotEmpty({ message: "Tên đăng nhập không được để trống" })
  username: string;

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
