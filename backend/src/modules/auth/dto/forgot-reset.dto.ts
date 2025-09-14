import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

// export class ResetPasswordDto {
//   @IsEmail()
//   email: string;
//
//   @IsString()
//   @Length(6)
//   newPassword: string;
//
//   @IsString()
//   @IsNotEmpty()
//   token: string;
// }

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetPasswordToken: string;

  @IsString()
  @Length(6)
  newPassword: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @Length(6)
  newPassword: string;
}
