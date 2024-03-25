import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req, res) => {
  /*
      1. first check the register credentials;
      2. check if the user already exists in the database; using the email and username;
      3. if the user does not exist, create a new user;
      4. if the user exists, return an error message; 
      5. if avatar, upload it to cloudinary; 
      6. create user object and save it in the mongoDB database; 
      7. remove password and refresh token field from response
      // check for user creation and return success message
   */

  const { fullName, username, email, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  
  const avatarLocalPath = req.file?.avatar[0]?.path; 
  const coverImageLocalPath = req.file?.coverImage[0]?.path; 
  if (!avatarLocalPath) {
     throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage =   await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(500, "Error uploading avatar");
  }

  const user = await User.create({
    fullName,
    username,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  }); 

  const createdUser = await User.findById(user?._id).select("-password -refreshToken");  

  if(!createdUser){
    throw new ApiError(500, "Error creating user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully")); 
});

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "OK" });
});

export { registerUser, loginUser };
