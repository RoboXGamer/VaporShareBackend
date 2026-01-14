import { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User, IUserDocument } from "../models/user";

interface JwtPayload {
  _id: string;
}

export const verifyJWT: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.get("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Unauthorized request");
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!,
      ) as JwtPayload;

      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken",
      );

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user as IUserDocument;
      next();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Invalid access token";
      throw new ApiError(401, message);
    }
  },
);
