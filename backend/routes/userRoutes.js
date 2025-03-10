const express = require("express");
const { body, validationResult } = require("express-validator");

const {
  register,
  login,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const verifyToken = require("../verifyToken");
const router = express.Router();

//User routes
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      })
      .withMessage("Confirm Password must match Password"),
  ],
  register
);
router.post("/login", login);
router.get("/users", verifyToken, getUsers); // CRUD: Read
router.put("/users/:id", verifyToken, updateUser); // CRUD: Update
router.delete("/users/:id", verifyToken, deleteUser); // CRUD: Delete

module.exports = router;
