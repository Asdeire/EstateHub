import cron from "node-cron";

export class CronHandler {
  static scheduleExpiredCodeCleanup(
    clearExpiredCodes: () => Promise<void>
  ): void {
    cron.schedule("*/10 * * * *", async () => {
      try {
        console.log("Running cleanup task for expired verification codes...");

        await clearExpiredCodes();

        console.log("Expired verification codes cleaned.");
      } catch (error) {
        console.error(
          "Error while cleaning expired verification codes:",
          error
        );
      }
    });
  }
}
