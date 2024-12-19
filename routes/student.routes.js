const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware.js");
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controller/student.controller.js");

const router = express.Router();

router.post("/", verifyJWT, createStudent);
router.get("/", verifyJWT, getAllStudents);
router.get("/:id", verifyJWT, getStudentById);
router.put("/:id", verifyJWT, updateStudent);
router.delete("/:id", verifyJWT, deleteStudent);

module.exports = router;
