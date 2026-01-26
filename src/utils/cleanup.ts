import cron from "node-cron";
import { File } from "../models/file";
import { User } from "../models/user";
import { utapi } from "./uploadthing";
import logger from "./logger";

export const startCleanupJob = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    logger.info("Starting expired files cleanup job...");
    try {
      const expiredFiles = await File.find({ expiry: { $lt: new Date() } });

      if (expiredFiles.length === 0) {
        logger.info("No expired files found.");
        return;
      }

      for (const file of expiredFiles) {
        try {
          // 1. Delete from UploadThing
          await utapi.deleteFiles(file.fileKey);

          // 2. Update user storage
          await User.findByIdAndUpdate(file.userid, {
            $inc: { currentStorageUsed: -file.size },
          });

          // 3. Delete from DB
          await File.findByIdAndDelete(file._id);

          logger.info(
            `Cleaned up expired file: ${file.filename} (${file._id})`,
          );
        } catch (error) {
          logger.error(`Failed to cleanup file ${file._id}:`, error);
        }
      }
      logger.info(
        `Cleanup job completed. Cleaned ${expiredFiles.length} files.`,
      );
    } catch (error) {
      logger.error("Error in cleanup job:", error);
    }
  });
};
