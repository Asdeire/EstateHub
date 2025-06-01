import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { swaggerSchemas } from "../schemas/swagger.schemas";

const authController = new AuthController();

export async function authRoutes(fastify: FastifyInstance) {
  for (const [key, schema] of Object.entries(swaggerSchemas)) {
    fastify.addSchema({ $id: key, ...schema });
  }

  fastify.post("/login", {
    schema: {
      summary: "User login",
      tags: ["Auth"],
      body: { $ref: "LoginRequest#" },
      response: {
        200: { $ref: "LoginResponse#" },
      },
    },
    handler: authController.login.bind(authController),
  });

  fastify.post("/refresh", {
    schema: {
      summary: "Refresh user token",
      tags: ["Auth"],
      response: {
        200: { $ref: "RefreshResponse#" },
      },
    },
    handler: authController.refreshToken.bind(authController),
  });

  fastify.post("/register", {
    schema: {
      summary: "User registration",
      tags: ["Auth"],
      body: { $ref: "RegisterRequest#" },
      response: {
        201: { $ref: "RegisterResponse#" },
      },
    },
    handler: authController.register.bind(authController),
  });

  fastify.post("/verify", {
    schema: {
      summary: "Verify email",
      tags: ["Auth"],
      body: { $ref: "VerifyRequest#" },
      response: {
        200: { type: "null" },
      },
    },
    handler: authController.verify.bind(authController),
  });

  fastify.post("/password-reset", {
    schema: {
      summary: "Request password reset",
      tags: ["Auth"],
      body: { $ref: "PasswordResetRequest#" },
      response: {
        200: { type: "null" },
      },
    },
    handler: authController.requestPasswordReset.bind(authController),
  });

  fastify.post("/password-reset/confirm", {
    schema: {
      summary: "Confirm password reset",
      tags: ["Auth"],
      body: { $ref: "PasswordResetConfirmRequest#" },
      response: {
        200: { type: "null" },
      },
    },
    handler: authController.resetPassword.bind(authController),
  });
}
