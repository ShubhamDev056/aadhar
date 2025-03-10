const express = require("express");
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
router.post("/register", register);
router.post("/login", login);
router.get("/users", verifyToken, getUsers); // CRUD: Read
router.put("/users/:id", verifyToken, updateUser); // CRUD: Update
router.delete("/users/:id", verifyToken, deleteUser); // CRUD: Delete

module.exports = router;
