import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { authService } from "../services/auth";
import {
  loginSchema,
  registerSchema,
  verifySchema,
  passwordResetSchema,
} from "../schemas/auth.schemas";

import { config } from "../utils/config";

export class AuthController {
  private handleError(reply: FastifyReply, error: unknown) {
    if (error instanceof Error) {
      return reply.status(500).send({ message: error.message });
    }
    console.error("Unexpected error:", error);
    return reply.status(500).send({ message: "An unknown error occurred" });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsedBody = loginSchema.parse(request.body);

      const { email, password } = parsedBody;

      const { accessToken, refreshToken, user, expiresAt } =
        await authService.login({
          email,
          password,
        });

      return reply
        .status(200)
        .setCookie("_session", refreshToken, {
          path: "/refresh",
          expires: new Date(expiresAt),
        })
        .send({ token: accessToken, user });
    } catch (error) {
      return this.handleError(reply, error);
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const sessionCookie = request.cookies._session;

      if (!sessionCookie) {
        return reply.status(401).send({ message: "Session not found" });
      }

      const { value, valid } = request.server.unsignCookie(sessionCookie);

      if (!valid) {
        return reply
          .status(401)
          .send({ message: "Invalid or expired refresh token" });
      }

      const { accessToken, user } = await authService.refreshTokens(value);

      return reply.status(200).send({ token: accessToken, user });
    } catch (error) {
      if ((error as Error).message === "Invalid or expired refresh token") {
        reply.clearCookie("_session", { path: "/refresh" });
      }

      return this.handleError(reply, error);
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsedBody = registerSchema.parse(request.body);

      const { name, email, password, role } = parsedBody;

      const existingUser = await authService.findUserByEmail(email);

      if (existingUser) {
        return reply.status(400).send({ message: "Email is already in use" });
      }

      await authService.sendVerificationCode({
        purpose: "registration",
        email,
      });

      return reply
        .status(201)
        .send({ message: `Verification code sent to ${email}` });
    } catch (error) {
      return this.handleError(reply, error);
    }
  }

  async verify(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsedBody = verifySchema.parse(request.body);

      // prevent password hash from being sent in the response
      const { password_hash, ...userData } =
        await authService.verifyCodeAndRegisterUser(parsedBody);

      return reply
        .status(201)
        .send({ message: "User registered successfully", user: userData });
    } catch (error) {
      return this.handleError(reply, error);
    }
  }

  async sendPasswordResetCode(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsedBody = z
        .object({ email: z.string().email() })
        .parse(request.body);

      const { email } = parsedBody;

      await authService.sendPasswordResetCode(email);

      return reply
        .status(200)
        .send({ message: `Password reset code sent to ${email}` });
    } catch (error) {
      return this.handleError(reply, error);
    }
  }

  async requestPasswordReset(
    request: FastifyRequest<{ Body: { email: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { email } = request.body;

      if (!email) {
        return reply.status(400).send({ message: "Email is required" });
      }

      await authService.sendPasswordResetCode(email);

      return reply
        .status(200)
        .send({ message: "Password reset code sent to your email" });
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(500).send({ message: error.message });
      }
      console.error("Unexpected error:", error);
      return reply.status(500).send({ message: "An unknown error occurred" });
    }
  }

  async resetPassword(
    request: FastifyRequest<{
      Body: { email: string; code: string; newPassword: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { email, code, newPassword } = passwordResetSchema.parse(
        request.body
      );

      if (!email || !code || !newPassword) {
        return reply.status(400).send({
          message: "Email, verification code, and new password are required",
        });
      }

      await authService.resetPassword(email, code, newPassword);

      return reply.status(200).send({ message: "Password reset successfully" });
    } catch (error) {
      return this.handleError(reply, error);
    }
  }
}
