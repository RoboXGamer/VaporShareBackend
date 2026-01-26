import { app } from "./app";
import { connectDB } from "./db";
import logger from "./utils/logger";
import { startCleanupJob } from "./utils/cleanup";

async function main() {
  try {
    await connectDB();
    startCleanupJob();
    app.listen(process.env.PORT || 8000, () => {
      logger.info(`Server is running on port ${process.env.PORT || 8000}`);
    });
  } catch (error) {
    logger.error("Error connecting to DB", error);
  }
}

main();
