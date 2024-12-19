// const { PrismaClient } = require("@prisma/client");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken')
// const prisma = new PrismaClient();
const { PrismaClient } = require('@prisma/client');
const generateAccessAndRefreshTokens = require("../utils/tokengenerator");
const prisma = new PrismaClient();

const registerUser = asyncHandler(async (req,res)=>{
  console.log('registerUser')
    const { name, email, password } = req.body;
    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
      }
      const existedUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existedUser) {
        throw new ApiError(409, "Email is already registered");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("hashed",hashedPassword); // Log the hashed password to verify

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword, // Store the hashed password
        },
      });
      console.log('Users:', user);

      const createdUserConfirm = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true }, // Exclude password
      });
      if (!createdUserConfirm) {
        throw new ApiError(500, "Something went wrong while registering the user");
      }
      return res
      .status(201)
      .json(
        new ApiResponse(200, createdUserConfirm, "User register successfully")
      );
})
const loginUser = asyncHandler(async(req,res)=>{
const {email,password} =req.body;
if(!email||!password){
  throw new ApiError(400, "Email and password are required");
}
const user = await prisma.user.findUnique({
  where: { email }, // Search for the user by email
});

if (!user) {
  throw new ApiError(404, "User does not exist");
}
const isPasswordValid = await bcrypt.compare(password, user.password);
if (!isPasswordValid) {
  throw new ApiError(401, "Invalid password");
}
const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id,user.name);

await prisma.user.update({
  where: { id: user.id },
  data: { refreshToken }, // Store the refresh token in the user's record
});

const loggedInUser = {
  id: user.id,
  name: user.name,
  email: user.email,
  // Include other fields that you want to send in the response
};
const options = {
  httpOnly: true, // Prevents client-side access to cookies
  secure: process.env.NODE_ENV === 'production', // Ensure cookies are only sent over HTTPS in production
};
return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
})
const logoutUser = asyncHandler(async (req, res) => {
  // Get the user ID from the authenticated request (ensure the user is logged in)
  const userId = req.user.id; // Assuming user ID is set in the request after authentication (e.g., from a JWT)
console.log('userId',userId)
  // Remove the refreshToken from the user in the PostgreSQL database
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: null, // Unset the refreshToken field
    },
  });
  console.log('updatedUser',updatedUser)


  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  // Options for cookies to ensure security
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set this to true in production for secure cookies
  };

  // Clear the accessToken and refreshToken cookies
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookie.refreshToken ||req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "RefreshToken not found");
  }
  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
console.log('decodedToken',decodedToken)
  const user = await prisma.user.findUnique({
    where:{id:decodedToken?.userId}
  })
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }
  const options = {
    httpOnly: true,
    secure: true, // Ensure your app is running over HTTPS for secure cookies
  };
  const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user.id,user.name);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newrefreshToken }, // Store the new refresh token
  });

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", newrefreshToken, options)
  .json(
    new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Access token refreshed")
  );
})
module.exports = { registerUser, loginUser ,logoutUser,refreshAccessToken};
