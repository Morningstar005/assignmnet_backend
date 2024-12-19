// middlewares/auth.middleware.js

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const ApiError = require("../utils/ApiError"); // Correct import
const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("../utils/asyncHandler.js");

// Load environment variables
dotenv.config();
const prisma = new PrismaClient();

// Middleware to verify JWT
const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  console.log("token", token);
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  console.log("decodedToken", decodedToken);
  const user = await prisma.user.findUnique({
    where: { id: decodedToken?.userId },
    select: { id: true, name: true }, // Adjust the fields you need, excluding password
  });

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }
  console.log("user", user);

  req.user = user;
  next();
});

module.exports = { verifyJWT };
