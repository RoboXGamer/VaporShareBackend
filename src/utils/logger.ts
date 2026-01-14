import winston from "winston";

const { combine, timestamp, json, colorize, printf } = winston.format;

// Custom format for console logging
const consoleLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: [
    // Standard error logs to a file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // All logs to a combined file
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If we're in development, also log to the console with colors
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "HH:mm:ss" }),
        consoleLogFormat,
      ),
    }),
  );
}

export default logger;
