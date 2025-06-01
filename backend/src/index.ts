import fastify from "fastify";
import { registerRoutes } from "./routes";
import cors from "@fastify/cors";
import { authMiddleware } from "./middleware/auth.middleware";
import { config } from "./utils/config";
import swagger from "./utils/swagger";

import type { FastifyCookieOptions } from "@fastify/cookie";
import cookie from "@fastify/cookie";

const start = async () => {
  const app = fastify({ logger: true });

  await app.register(cors, {
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  });

  await app.register(cookie, {
    secret: config.cookieSecret,
    parseOptions: {
      domain: config.cookieDomain,
      secure: config.isProduction,
      httpOnly: true,
      signed: true,
      sameSite: "strict", // CSRF protection
    },
  } as FastifyCookieOptions);

  await app.register(swagger);

  app.addHook("preHandler", authMiddleware);

  registerRoutes(app);

  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
    app.log.info(`Server listening on ${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
