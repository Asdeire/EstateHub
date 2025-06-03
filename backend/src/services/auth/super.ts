import bcrypt from "bcrypt";
import { addMinutes } from "date-fns";
import { randomUUID } from "node:crypto";

import type * as AuthScope from "./context";
import type * as AuthDTO from "./dto";

export class AuthService {
  private emailHandler: AuthScope.ConstructorParams["emailHandler"];
  private tokenHandler: AuthScope.ConstructorParams["tokenHandler"];
  private cronHandler: AuthScope.ConstructorParams["cronHandler"];
  private userRepository: AuthScope.ConstructorParams["userRepository"];
  private verificationCodeRepository: AuthScope.ConstructorParams["verificationCodeRepository"];

  constructor(dependencies: AuthScope.ConstructorParams) {
    this.emailHandler = dependencies.emailHandler;
    this.tokenHandler = dependencies.tokenHandler;
    this.cronHandler = dependencies.cronHandler;

    this.userRepository = dependencies.userRepository;
    this.verificationCodeRepository = dependencies.verificationCodeRepository;

    this.cronHandler.scheduleExpiredCodeCleanup(async () => {
      this.verificationCodeRepository.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
    });
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findUnique({
      where: { email },
    });
  }

  async login(dto: AuthDTO.LoginUser): Promise<
    AuthScope.TokensPair & { user: AuthScope.TokenPayload } & {
      expiresAt: number;
    }
  > {
    const user = await this.findUserByEmail(dto.email);

    if (!user) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);

    if (!isMatch) throw new Error("Invalid email or password");

    const sessionId = randomUUID();

    const accessToken = await this.tokenHandler.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    });

    const refreshToken = await this.tokenHandler.generateRefreshToken({
      userId: user.id,
      sessionId,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      expiresAt: this.tokenHandler.resolveRefreshLifetimeBefore(),
    };
  }

  async register(dto: AuthDTO.RegisterUser) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return await this.userRepository.create({
      data: {
        role: dto.role,
        name: dto.name,
        email: dto.email,
        password_hash: hashedPassword,
        fop_code: dto.fop_code || "none",
      },
    });
  }

  async sendVerificationCode(dto: AuthDTO.SendVerificationCode): Promise<void> {
    // Rate limit: max 3 codes per hour per email/purpose
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCodes = await this.verificationCodeRepository.findMany?.({
      where: {
        email: dto.email,
        createdAt: { gt: oneHourAgo },
      },
    });

    if (recentCodes && recentCodes.length >= 3) {
      throw new Error(
        "Too many verification code requests. Please try again later."
      );
    }

    // Invalidate old codes for this email/purpose
    await this.verificationCodeRepository.deleteMany?.({
      where: {
        email: dto.email,
      },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(
      `Sending verification code ${code} to ${dto.email} for purpose ${dto.purpose}`
    );

    await this.verificationCodeRepository.create({
      data: {
        email: dto.email,
        code,
        expiresAt: addMinutes(new Date(), 5),
        createdAt: new Date(),
      },
    });

    await this.emailHandler.sendVerificationEmail(dto.email, code, dto.purpose);
  }

  async verifyCodeAndRegisterUser(dto: AuthDTO.VerifyCodeAndRegisterUser) {
    const { code, ...registerDto } = dto;

    const record = await this.verificationCodeRepository.findFirst({
      where: {
        code,
        email: registerDto.email,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      throw new Error("Invalid or expired verification code");
    }

    const [registeredUser] = await Promise.all([
      this.register(registerDto),
      this.verificationCodeRepository.delete({ where: { id: record.id } }),
    ]);

    return registeredUser;
  }

  async sendPasswordResetCode(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);

    if (!user) throw new Error("User not found");

    await this.sendVerificationCode({ email, purpose: "password-reset" });
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    const record = await this.verificationCodeRepository.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      throw new Error("Invalid or expired password reset code");
    }

    await Promise.all([
      this.verificationCodeRepository.delete({ where: { id: record.id } }),
      this.userRepository.update({
        where: { email },
        data: { password_hash: await bcrypt.hash(newPassword, 10) },
      }),
    ]);
  }

  async refreshTokens(refreshToken: string): Promise<
    AuthScope.TokensPair & { user: AuthScope.TokenPayload } & {
      expiresAt: number;
    }
  > {
    const session = await this.tokenHandler.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findUnique({
      where: { id: session.userId },
    });

    if (!user) throw new Error("Invalid session");

    const accessToken = await this.tokenHandler.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.sessionId,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
      expiresAt: session.expiresAt,
    };
  }
}
