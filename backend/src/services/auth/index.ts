import { PrismaClient } from "@prisma/client";

import { AuthService } from "./super";

import { CronHandler } from "./handlers/cron";
import { EmailHandler } from "./handlers/email";
import { TokenHandler } from "./handlers/token";

import { EmailService } from "./../email.service";

import { config } from "./../../utils/config";

const { user, verificationCode } = new PrismaClient();

const authService = new AuthService({
  emailHandler: new EmailHandler({ emailService: new EmailService() }),
  tokenHandler: new TokenHandler(
    config.jwtSecret,
    config.jwtExpiresIn,
    config.refreshSecret,
    config.refreshExpiresIn
  ),
  cronHandler: CronHandler,

  userRepository: user,
  verificationCodeRepository: verificationCode,
});

export { authService };
export default authService;
