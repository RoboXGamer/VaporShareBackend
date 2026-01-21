import { User } from "@/model/user.model";
import { apiError } from "@/utils/apiError";
import { asyncHandler } from "@/utils/asyncHandler";
import jwt, { JwtPayload } from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
    console.log({decodedToken})

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new apiError(401, "Invalid access token");
    }

    // @ts-ignore
    req.user = user;

    next();
  } catch (error: unknown) {
    throw new apiError(500, "Authentication failed");
  }
});
