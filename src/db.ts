import mongoose from "mongoose";
import logger from "./utils/logger";

const DB_NAME = "VaporShare";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );
    logger.info(
      `MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    logger.error("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export { connectDB };
