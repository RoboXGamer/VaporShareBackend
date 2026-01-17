import dotenv from "dotenv";
import { connectDB } from "./db/connect.db";

dotenv.config();

connectDB()
