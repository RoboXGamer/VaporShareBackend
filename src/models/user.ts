import { model, Schema, Document, Types } from "mongoose";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

// Define the schema with Zod for inference and validation
export const UserZodSchema = z.object({
  username: z.string().min(3).toLowerCase().trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6),
  fullName: z.string().min(1).trim(),
  refreshToken: z.string().optional(),
  type: z.enum(["sender", "receiver"]),
});

// Infer TypeScript type from Zod schema
export type UserType = z.infer<typeof UserZodSchema>;

// Define the Document interface for Mongoose
export interface IUserDocument extends UserType, Document {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    type: {
      type: String,
      enum: ["sender", "receiver"],
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// Mongoose middleware for password hashing
userSchema.pre("save", async function (next: any) {
  const user = this as any;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

// Model methods
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET as Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as Secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any,
    },
  );
};

export const User = model<IUserDocument>("User", userSchema);
