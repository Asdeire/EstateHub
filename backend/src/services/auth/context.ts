export type UserRole = "User" | "Makler";

export type Config = {
  jwtSecret: string;
  jwtExpiresIn: string;
};

export interface IEmailService {
  sendNotificationEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void>;
}

export interface IUserRepository {
  findUnique(params: { where: { email: string } }): Promise<any>;
  create(data: any): Promise<any>;
  update(params: { where: { email: string }; data: any }): Promise<any>;
}

export interface IVerificationCodeRepository {
  create(data: any): Promise<any>;
  findFirst(params: any): Promise<any>;
  delete(params: { where: { id: string } }): Promise<any>;
  deleteMany(params: any): Promise<any>;
}

export type ConstructorParams = {
  emailHandler: import("./handlers/email").EmailHandler;
  tokenHandler: import("./handlers/token").TokenHandler;
  cronHandler: typeof import("./handlers/cron").CronHandler;

  userRepository: import("@prisma/client").PrismaClient["user"];
  verificationCodeRepository: import("@prisma/client").PrismaClient["verificationCode"];
};

export type SessionOptions = {
  userId: string;
  sessionId: string;
  expiresAt?: number;
};

export type TokenPayload = {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
};

export type TokensPair = {
  accessToken: string;
  refreshToken: string;
};

export interface TokenHandlerOptions {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export interface EmailHandlerOptions {
  emailService: IEmailService;
}
