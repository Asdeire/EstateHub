import type * as AuthScope from "./../context";

export class EmailHandler {
  private emailService: AuthScope.IEmailService;

  constructor(options: AuthScope.EmailHandlerOptions) {
    this.emailService = options.emailService;
  }

  async sendVerificationEmail(
    email: string,
    code: string,
    purpose: "registration" | "password-reset"
  ): Promise<void> {
    const subject =
      purpose === "registration"
        ? "Verification Code for Registration"
        : "Password Reset Code";

    const html = `<p>Your ${
      purpose === "registration" ? "verification" : "password reset"
    } code is: <strong>${code}</strong></p>`;

    // await this.emailService.sendNotificationEmail(email, subject, html);
  }

  // You can add more email-related methods here as needed
}
