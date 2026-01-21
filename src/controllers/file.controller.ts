import { File } from "@/model/file.model";
import { apiError } from "@/utils/apiError";
import { apiResponse } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import crypto from "crypto";

const fileUpload = asyncHandler(async (req, res) => {
  // @ts-ignore
  if(req.user.type == "receiver"){
    throw new apiError(403, "User not a sender")
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
    .json(new apiResponse(200, createdFile, "File created successfully"));
});

export { fileUpload };
