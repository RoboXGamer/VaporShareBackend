import { createUploadthing, type FileRouter } from "uploadthing/express";
import { UTApi } from "uploadthing/server";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { File } from "../models/file";
import { ApiError } from "./ApiError";
import { z } from "zod";
import { nanoid } from "nanoid";

const f = createUploadthing();
export const utapi = new UTApi();

const MAX_STORAGE_PER_USER = 100 * 1024 * 1024; // 100MB

export const uploadRouter = {
  fileUploader: f({
    blob: {
      maxFileSize: "128MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        filename: z.string(),
        description: z.string(),
        category: z.string(),
        expiry: z.string(), // ISO string from client
        password: z.string().optional(),
      }),
    )
    .middleware(async ({ req, input }) => {
      try {
        const token =
          req.cookies?.accessToken ||
          req.headers.authorization?.replace("Bearer ", "");

        if (!token) throw new ApiError(401, "Unauthorized");

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
          _id: string;
        };

        const user = await User.findById(decoded._id);
        if (!user) throw new ApiError(401, "User not found");
        if (user.type !== "sender")
          throw new ApiError(403, "Only senders can upload files");

        if (user.currentStorageUsed >= MAX_STORAGE_PER_USER) {
          throw new ApiError(400, "Storage limit reached (100MB)");
        }

        const serverKey = nanoid(10); // Generate 10-char key

        return { userId: user._id, input, serverKey };
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(401, "Invalid token");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId, input, serverKey } = metadata;

      // Create File record
      await File.create({
        ...input,
        key: serverKey, // Use server-generated key
        expiry: new Date(input.expiry),
        userid: userId,
        fileUrl: file.url,
        fileKey: file.key,
        size: file.size,
      });

      // Update User storage
      await User.findByIdAndUpdate(userId, {
        $inc: { currentStorageUsed: file.size },
      });

      console.log("Upload complete for userId:", userId, "Key:", serverKey);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
