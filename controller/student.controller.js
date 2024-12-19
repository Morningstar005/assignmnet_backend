const { PrismaClient } = require("@prisma/client");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const prisma = new PrismaClient();

// Create a new student
const createStudent = asyncHandler(async (req, res) => {
  const { name, cohort, courses } = req.body;
  const userId = req.user.id; // Get the logged-in user's ID from the request

  // Validate required fields
  if (!name || !cohort || !courses) {
    throw new ApiError(400, "Name, cohort, and courses are required.");
  }

  // Create the new student and associate with the logged-in user
  const newStudent = await prisma.student.create({
    data: {
      name,
      cohort,
      courses,
      userId, // Associate the student with the logged-in user
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { student: newStudent },
        "Student created successfully"
      )
    );
});
// Get a single student by ID

const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, student, "Student retrieved successfully"));
});

// Get all students
const getAllStudents = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Get the logged-in user's ID from the request

  const students = await prisma.student.findMany({
    where: {
      userId, // Only fetch students created by the logged-in user
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { students }, "Students fetched successfully"));
});

// Update a student by ID
const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, cohort, courses } = req.body;
  const userId = req.user.id; // Get the logged-in user's ID from the request

  try {
    // Find the student by ID
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id, 10) },
    });

    // If the student doesn't exist, throw an error
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Check if the logged-in user is the owner of the student record
    if (student.userId !== userId) {
      throw new ApiError(403, "You are not authorized to update this student");
    }

    // Update the student record if ownership is verified
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(name && { name }),
        ...(cohort && { cohort }),
        ...(courses && { courses }),
      },
    });

    // Return a success response
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedStudent, "Student updated successfully")
      );
  } catch (error) {
    console.error("Error updating student:", error.message);

    // Handle errors, if any
    if (error instanceof ApiError) {
      throw error; // Rethrow custom errors
    }

    throw new ApiError(500, "Internal server error");
  }
});

// Delete a student by ID
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Get the logged-in user's ID from the request

  try {
    // Find the student by ID
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id, 10) },
    });

    // If the student doesn't exist, throw an error
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Check if the logged-in user is the owner of the student record
    if (student.userId !== userId) {
      throw new ApiError(403, "You are not authorized to delete this student");
    }

    // Delete the student record if ownership is verified
    await prisma.student.delete({
      where: { id: parseInt(id, 10) },
    });

    // Return a success response
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Student deleted successfully"));
  } catch (error) {
    console.error("Error deleting student:", error.message);

    // Handle specific Prisma error for record not found
    if (error instanceof ApiError) {
      throw error; // Rethrow custom errors
    }

    throw new ApiError(500, "Internal server error");
  }
});

module.exports = {
  createStudent,
  getStudentById,
  getAllStudents,
  updateStudent,
  deleteStudent,
};
