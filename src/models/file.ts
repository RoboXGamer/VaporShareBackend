import { model, Schema, Document } from "mongoose";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const FileZodSchema = z.object({
  filename: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  key: z.string().min(1),
  expiry: z.date(),
  userid: z.string(),
  fileUrl: z.string().url(),
  fileKey: z.string().min(1),
  size: z.number().positive(),
  password: z.string().optional(),
  isRevoked: z.boolean().default(false),
  downloadCount: z.number().default(0),
  accessLogs: z
    .array(
      z.object({
        ip: z.string(),
        accessedAt: z.date(),
      }),
    )
    .default([]),
});

export type FileType = z.infer<typeof FileZodSchema>;

const fileSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    accessLogs: [
      {
        ip: String,
        accessedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiry: {
      type: Date,
      required: true,
    },
    userid: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileKey: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

// Hash password before saving if it exists
fileSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

export const File = model("File", fileSchema);
