import { RequestHandler } from "express";
import { File } from "../models/file";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createFileRecord: RequestHandler = asyncHandler(
  async (req, res) => {
    const { filename, description, category, key, expiry } = req.body;

    if (
      [filename, description, category, key, expiry].some((field) => !field)
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const file = await File.create({
      filename,
      description,
      category,
      key,
      expiry,
      userid: req.user?._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, file, "File record created successfully"));
  },
);

export const getPersonalHistory: RequestHandler = asyncHandler(
  async (req, res) => {
    const files = await File.find({ userid: req.user?._id });

    return res
      .status(200)
      .json(
        new ApiResponse(200, files, "Personal history retrieved successfully"),
      );
  },
);

export const getAllFiles: RequestHandler = asyncHandler(async (_req, res) => {
  const files = await File.find().populate("userid", "fullName username email");

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

  return res
    .status(200)
    .json(new ApiResponse(200, file, "File details retrieved successfully"));
});
