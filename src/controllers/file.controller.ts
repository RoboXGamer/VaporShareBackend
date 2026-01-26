import { RequestHandler } from "express";
import { File } from "../models/file";
import { User } from "../models/user";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { utapi } from "../utils/uploadthing";
import bcrypt from "bcryptjs";

export const getPersonalHistory: RequestHandler = asyncHandler(
  async (req, res) => {
    const files = await File.find({ userid: req.user?._id }).sort({
      createdAt: -1,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, files, "Personal history retrieved successfully"),
      );
  },
);

export const getAllFiles: RequestHandler = asyncHandler(async (_req, res) => {
  // Only show non-expired and non-revoked files
  const files = await File.find({
    expiry: { $gt: new Date() },
    isRevoked: false,
  })
    .populate("userid", "fullName username email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, files, "All file records retrieved successfully"),
    );
});

export const getFileDetails: RequestHandler = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await File.findById(fileId).populate(
    "userid",
    "fullName username email",
  );

  if (!file) {
    throw new ApiError(404, "File record not found");
  }

  // Expiry check
  if (file.expiry < new Date()) {
    throw new ApiError(410, "This file has expired");
  }

  // Revoked check
  if (file.isRevoked) {
    throw new ApiError(403, "This file has been revoked by the sender");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, file, "File details retrieved successfully"));
});

export const getFileByKey: RequestHandler = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { password } = req.query; // Optional password from query string

  const file = await File.findOne({ key }).populate(
    "userid",
    "fullName username email",
  );

  if (!file) {
    throw new ApiError(404, "File not found with the provided key");
  }

  // Expiry check
  if (file.expiry < new Date()) {
    throw new ApiError(410, "This file has expired");
  }

  // Revoked check
  if (file.isRevoked) {
    throw new ApiError(403, "This file has been revoked by the sender");
  }

  // Password check
  if (file.password) {
    if (!password) {
      // If password is required but not provided, return metadata but hide URL
      const fileData = file.toObject();
      delete (fileData as any).fileUrl;
      delete (fileData as any).fileKey;
      delete (fileData as any).password;
      return res
        .status(401)
        .json(
          new ApiResponse(
            401,
            { ...fileData, passwordRequired: true },
            "Password required to access this file",
          ),
        );
    }

    const isMatch = await bcrypt.compare(password as string, file.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid password for this file");
    }
  }

  // Update audit logs and download count
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  file.downloadCount += 1;
  file.accessLogs.push({ ip: ip.toString(), accessedAt: new Date() });
  await file.save();

  return res
    .status(200)
    .json(new ApiResponse(200, file, "File retrieved successfully by key"));
});

export const revokeFile: RequestHandler = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await File.findById(fileId);

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  // Check ownership
  if (file.userid.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You do not have permission to revoke this file");
  }

  file.isRevoked = true;
  await file.save();

  return res
    .status(200)
    .json(new ApiResponse(200, file, "File access revoked successfully"));
});

export const updateFileRecord: RequestHandler = asyncHandler(
  async (req, res) => {
    const { fileId } = req.params;
    const { filename, description, category, expiry, isRevoked } = req.body;

    const file = await File.findById(fileId);

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    // Check ownership
    if (file.userid.toString() !== req.user?._id.toString()) {
      throw new ApiError(403, "You do not have permission to update this file");
    }

    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      {
        $set: {
          filename: filename || file.filename,
          description: description || file.description,
          category: category || file.category,
          expiry: expiry ? new Date(expiry) : file.expiry,
          isRevoked: isRevoked !== undefined ? isRevoked : file.isRevoked,
        },
      },
      { new: true },
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedFile, "File record updated successfully"),
      );
  },
);

export const deleteFileRecord: RequestHandler = asyncHandler(
  async (req, res) => {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    // Check ownership
    if (file.userid.toString() !== req.user?._id.toString()) {
      throw new ApiError(403, "You do not have permission to delete this file");
    }

    // 1. Delete from UploadThing
    await utapi.deleteFiles(file.fileKey);

    // 2. Update user storage
    await User.findByIdAndUpdate(file.userid, {
      $inc: { currentStorageUsed: -file.size },
    });

    // 3. Delete from DB
    await File.findByIdAndDelete(fileId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "File deleted successfully"));
  },
);
