const express = require("express");
const {
  insertAadharDetails,
  getAadharData,
} = require("../controllers/aadharController");
const verifyToken = require("../verifyToken");
const router = express.Router();

//Aadhar routes
router.post("/insert-aadhar-details", verifyToken, insertAadharDetails); // CRUD: Read
router.get("/get-aadhar-details", verifyToken, getAadharData); // CRUD: U

module.exports = router;
