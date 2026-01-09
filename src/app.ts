import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { User } from "./models/user.model";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.header("test", "test");
  res.send("World!");
});

app.get("/test", (req, res) => {
  let name = "Prakhar";
  res.send({ name });
});

app.post("/register", async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    res.status(400).send({ message: "Username or email is required" });
    return;
  }
  const user = new User({ username, email });
  try {
    await user.save();
    res.send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error registering user", error });
  }
  console.log(user);
});
export { app };
