import { File } from "@/model/file.model";
import { User } from "@/model/user.model";
import { apiError } from "@/utils/apiError";
import { apiResponse } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import crypto from "crypto";

const fileUpload = asyncHandler(async (req, res) => {
  // @ts-ignore
  if (req.user.type != "sender") {
    throw new apiError(403, "User not allow to upload");
  }

  const { name, description, category } = req.body;

  // file name, category, expiry date must not be empty
  if (
    [name, category].some((e) => {
      e?.trim() == "";
    })
  ) {
    throw new apiError(400, "Submit non empty name, category or expiry Date");
  }

  // generate expiry date
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // generate key and hashing it
  const key = crypto.randomBytes(32).toString("hex");
  const hashedKey = crypto.createHash("sha256").update(key).digest("hex");
  const file = await File.create({
    name,
    description,
    category,
    expiryDate: expiry,
    key: hashedKey,
    // @ts-ignore
    userId: req.user._id,
  });
  const createdFile = await File.findById(file._id).select(
    "-key -expiryDate -userId",
  );
  if (!createdFile) {
    throw new apiError(500, "File creation failed");
  }
  res
    .status(201)
    .json(new apiResponse(200, {createdFile, key}, "File created successfully"));
});

const fileReceive = asyncHandler(async (req, res) => {
  const { key } = req.body;
  // type check
  // @ts-ignore
  if (req.user.type != "receiver") {
    throw new apiError(403, "User not receive file");
  }

  // chech for file with provided key
  const hashedKey = crypto.createHash("sha256").update(key).digest("hex");

  const file = await File.findOne({ key: hashedKey }).select(
    "-key -createdAt -updatedAt",
  );
  if (!file) {
    throw new apiError(404, "File not found");
  }

  // check if file have expired
  const date = new Date(Date.now())
  if(file.expiryDate <= date){
    await File.findOneAndDelete({ key: hashedKey })
    throw new apiError(410, "File have been expired")
  }

  // get data of sender
  const sender = await User.findById(file.userId).select(
    "-password -refreshToken",
  );
  if (!sender) {
    throw new apiError(500, "Failed to retrieve sender's data");
  }

  // file data with sender detail send to frontend
  res.status(200).json(
    new apiResponse(
      200,
      {
        "file name": file.name,
        description: file.description,
        category: file.category,
        expiryDate: file.expiryDate,
        sender: sender.username,
      },
      "File retrieve successfully",
    ),
  );
});

export { fileUpload, fileReceive };
