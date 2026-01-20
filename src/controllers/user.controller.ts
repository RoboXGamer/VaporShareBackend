import { asyncHandler } from "../utils/asyncHandler";
import { User } from "@/model/user.model";
import { apiError } from "@/utils/apiError";
import { apiResponse } from "@/utils/apiResponse";

const generateAccessAndRefreshTokens = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating access or refesh token",
    );
  }
};

const registerUser: Function = asyncHandler(async (req, res) => {
  // get data from body
  const { username, password, type } = req.body;

  // valdiation - no empty submition
  if ([username, password, type].some((e) => e?.trim() == "")) {
    throw new apiError(400, "fill all detail");
  }
  // check if already present in db: username
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new apiError(409, "User already exists");
  }

  // if not then create user in db {create an obj}
  const user = await User.create({ username, password, type });

  // check for successful creation and remove password from response from db
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new apiError(500, "User creation failed");
  }

  // send success message
  res
    .status(201)
    .json(new apiResponse(200, createdUser, "User created successfully"));
});

const loginUser: Function = asyncHandler(async (req, res) => {
  // req.body data retreival
  const { username, password } = req.body;

  if (!username || !password) {
    throw new apiError(400, "Username or password not found");
  }

  // username or email check
  const user = await User.findOne({ username });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  // password check
  if (await user.isPasswordCorrect(password)) {
    throw new apiError(401, "Password is incorrect");
  }

  // generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = User.findOne(user._id).select("-password -refreshToken");

  // send cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully",
      ),
    );
});

const logoutUser: Function = asyncHandler(async (req, res) => {
  // remove refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true },
  );

  // remove cookies
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new apiResponse(200, {}, "User logged out"))

});

export { registerUser, loginUser, logoutUser };
