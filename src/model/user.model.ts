import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["sender", "receiver"],
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
