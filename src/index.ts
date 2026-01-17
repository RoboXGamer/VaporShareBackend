import dotenv from "dotenv";
import { connectDB } from "./db/connect.db";
import { app } from "./app";

dotenv.config();

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server connected successfully, port: ${process.env.PORT}`);
  });
});
