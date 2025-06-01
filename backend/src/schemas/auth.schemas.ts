import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const registerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  role: z.enum(["User", "Makler"], {
    message: 'Role must be either "User" or "Makler"',
  }),
});

export const verifySchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  code: z.string().length(6, { message: "Verification code must be 6 digits" }),
  name: z.string().min(1, { message: "Name is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  role: z.enum(["User", "Makler"], {
    message: 'Role must be either "User" or "Makler"',
  }),
});

export const passwordResetSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  code: z
    .string()
    .length(6, { message: "Password reset code must be 6 digits" }),
  newPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});
