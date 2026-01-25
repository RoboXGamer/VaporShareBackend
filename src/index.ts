import { connectDB } from "./db/connect.db";
import { app } from "./app";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server connected successfully, port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!", err);
  });
