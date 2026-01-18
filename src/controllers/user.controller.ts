import { asyncHandler } from "../utils/asyncHandler";
import { User } from "@/model/user.model";
import { apiError } from "@/utils/apiError";
import { apiResponse } from "@/utils/apiResponse";

const registerUser: Function = asyncHandler(async (req, res) => {
  // get data from body
  const { username, email, password, type } = req.body;

  // valdiation - no empty submition
  if ([username, email, password, type].some((e) => e?.trim() == "")) {
    throw new apiError(400, "fill all detail");
  }
  // check if already present in db: username
  const existingUser = await User.findOne({ $or: [username, email] });
  if (existingUser) {
    throw new apiError(409, "User already exists");
  }

  // if not then create user in db {create an obj}
  const user = await User.create({ username, email, password, type });

  // check for successful creation and remove password from response from db
  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new apiError(500, "User creation failed");
  }
  
  // send success message
  res.status(201).json(new apiResponse(200, createdUser, "User created successfully"))

});

export { registerUser };
