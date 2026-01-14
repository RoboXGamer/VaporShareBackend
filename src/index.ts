import { app } from "@/app";
import { connectDB } from "@/db";
import logger from "./utils/logger";

async function main() {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    logger.error("Error connecting to DB", error);
  }
}

main();
