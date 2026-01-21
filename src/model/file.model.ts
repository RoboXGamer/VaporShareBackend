import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      unique: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const File = mongoose.model("File", fileSchema);
