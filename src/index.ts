import { app } from "./app";
import { connectDB } from "./db";

async function main() {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Error connecting to DB", error);
  }
}

main();
