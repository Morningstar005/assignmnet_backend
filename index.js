const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const ApiError =require('./utils/ApiError.js')
const cors = require('cors');
const userRoute = require('./routes/user.routes.js');
const studentRoutes = require('./routes/student.routes.js')
const cookieParser = require('cookie-parser');
// Load environment variables from .env
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Express app
const app = express();
app.use(cors())
app.use(express.json()); // Middleware to parse JSON requests
app.use(express.urlencoded({extended:true,limit:"24kb"}))// fetching data from params
app.use(cookieParser())


// Routes

// Home Route
app.use('/api/users',userRoute);
app.use('/api/student',studentRoutes)
app.use((err, req, res, next) => {
    // If the error is an instance of ApiError, send a structured response
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors,  // Include any additional error details if necessary
        data: err.data || null,  // Include any associated data (if any)
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Only show stack in dev mode
      });
    }
  
    // Handle any other unexpected errors that are not ApiError instances
    console.error(err.stack);  // Log the stack trace for debugging
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Only show stack in dev mode
    });
  });

  module.exports = app;
