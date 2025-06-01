import { UserRole } from "./context";

export interface SendVerificationCode {
  email: string;
  purpose: "registration" | "password-reset";
}

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface VerifyCodeAndRegisterUser {
  email: string;
  code: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface ResetPassword {
  email: string;
  code: string;
  newPassword: string;
}
