import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["sender", "receiver"],
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

// encrypting password before saving or modifying

userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next()
  
  this.password = bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.genrateAccessToken = function (){
  return jwt.sign({
    _id: this._id,
    type: this.type
  },process.env.ACCESS_TOKEN_SECRET,{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  })
}
userSchema.methods.genrateRefreshToken = function (){
  return jwt.sign({
    _id: this._id,
    type: this.type
  },process.env.REFRESH_TOKEN_SECRET,{
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  })
}

export const User = mongoose.model("User", userSchema);
