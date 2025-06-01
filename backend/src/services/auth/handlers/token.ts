import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

import type * as AuthScope from "./../context";

export class TokenHandler {
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private refreshSecret: string;
  private refreshExpiresIn: string;

  constructor(
    jwtSecret: string,
    jwtExpiresIn: string,
    refreshSecret: string,
    refreshExpiresIn: string
  ) {
    this.jwtSecret = jwtSecret;
    this.jwtExpiresIn = jwtExpiresIn;
    this.refreshSecret = refreshSecret;
    this.refreshExpiresIn = refreshExpiresIn;
  }

  private async generateToken(
    payload: AuthScope.TokenPayload | AuthScope.SessionOptions,
    secret: string,
    expiresIn: string,
    options?: SignOptions,
    errorMessage: string = "Token generation failed"
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // @ts-ignore - zeit format (string | object | Buffer) are supported
      jwt.sign(
        payload,
        secret,
        { expiresIn: expiresIn, ...options },
        (err, token) => {
          if (err || !token) return reject(err || new Error(errorMessage));
          resolve(token);
        }
      );
    });
  }

  async generateAccessToken(
    payload: AuthScope.TokenPayload,
    options?: SignOptions
  ): Promise<string> {
    return this.generateToken(
      payload,
      this.jwtSecret,
      this.jwtExpiresIn,
      options,
      "Access token generation failed"
    );
  }

  resolveRefreshLifetimeBefore(): number {
    const sessionLifetimeDays = parseInt(this.refreshExpiresIn, 10);
    const sessionLifetimeSeconds = sessionLifetimeDays * 24 * 60 * 60 - 60; // Subtract 60 seconds for safety margin

    return sessionLifetimeSeconds * 1000 + Date.now();
  }

  async generateRefreshToken(
    opts: AuthScope.SessionOptions,
    options?: SignOptions
  ): Promise<string> {
    const sessionLifetimeBefore = this.resolveRefreshLifetimeBefore();

    return this.generateToken(
      {
        ...opts,
        expiresAt: sessionLifetimeBefore,
      },
      this.refreshSecret,
      this.refreshExpiresIn,
      options,
      "Refresh token generation failed"
    );
  }

  async verifyToken(token: string): Promise<AuthScope.TokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.jwtSecret, (err, decoded) => {
        if (err) return reject(new Error("Invalid or expired token"));
        resolve(decoded as AuthScope.TokenPayload);
      });
    });
  }

  async verifyRefreshToken(
    token: string
  ): Promise<AuthScope.SessionOptions & { expiresAt: number }> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.refreshSecret, (err, decoded) => {
        if (err) return reject(new Error("Invalid or expired refresh token"));
        resolve(decoded as AuthScope.SessionOptions & { expiresAt: number });
      });
    });
  }

  async decodeToken(token: string): Promise<null | JwtPayload | string> {
    return Promise.resolve(jwt.decode(token));
  }

  async refreshAccessToken(
    refreshToken: string,
    payload: AuthScope.TokenPayload
  ): Promise<string> {
    const sessionData = await this.verifyRefreshToken(refreshToken);

    return this.generateAccessToken({ ...payload, ...sessionData });
  }
}
