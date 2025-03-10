const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const CryptoJS = require("crypto-js");

const SECRET_KEY = "056Shubhamdev";

const SECRET_KEY_FOR_CLIENT_SIDE = "my-secret-key"; // Must match frontend key

const decryptAadhar = (encryptedAadhar) => {
  const bytes = CryptoJS.AES.decrypt(encryptedAadhar, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
// Register
exports.register = (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User registered successfully!" });
    }
  );
};

// CRUD Operations
exports.insertAadharDetails = (req, res) => {
  const { name, aadhar, age } = req.body;
  console.log("Received Aadhar Details:", name, aadhar, age);

  // Check if Aadhaar already exists
  db.query(
    "SELECT * FROM aadhar WHERE aadhar = ?",
    [aadhar],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (results.length > 0) {
        return res
          .status(400)
          .json({ message: "Aadhaar number already exists" });
      }

      // Insert new Aadhaar details
      db.query(
        "INSERT INTO aadhar (name, aadhar, age) VALUES (?, ?, ?)",
        [name, aadhar, age],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          res
            .status(201)
            .json({ message: "Aadhaar details successfully entered!" });
        }
      );
    }
  );
};

exports.getAadharData = (req, res) => {
  db.query("SELECT * FROM aadhar", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};
