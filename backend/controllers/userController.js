const jwt = require("jsonwebtoken");
const db = require("../config/db");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const { validationResult } = require("express-validator");


const SECRET_KEY = "056Shubhamdev";
const SECRET_KEY_FOR_CLIENT_SIDE = "my-secret-key"; // Must match frontend key

// Function to decrypt password from frontend
const decryptPassword = (encryptedPassword) => {
  const bytes = CryptoJS.AES.decrypt(
    encryptedPassword,
    SECRET_KEY_FOR_CLIENT_SIDE
  );
  return bytes.toString(CryptoJS.enc.Utf8); // Convert back to plain text
};

// Function to generate SHA-1 hash with salt
const hashPassword = (password, salt) => {
  return crypto
    .createHash("sha1")
    .update(password + salt)
    .digest("hex");
};

// **Register User**
exports.register = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  console.log("register body", req.body);

  // Check if email already exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    if (results.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    // Generate random salt
    const salt = crypto.randomBytes(16).toString("hex");

    // Hash password with salt
    const hashedPassword = hashPassword(password, salt);

    // Insert user into DB
    db.query(
      "INSERT INTO users (username, email, password, salt) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, salt],
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Database error", error: err });

        res.status(201).json({ message: "User registered successfully!" });
      }
    );
  });
};

// **Login User**
exports.login = (req, res) => {
  const { email, password } = req.body;
  console.log("body", email, password);

  const decryptedPassword = decryptPassword(password);
  console.log("Decrypted Password!!!!!!:", decryptedPassword);

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json(err);
    if (!result.length)
      return res.status(404).json({ message: "User not found!" });

    const user = result[0];

    // Recreate the hash with stored salt
    const hashedInputPassword = hashPassword(decryptedPassword, user.salt);

    if (hashedInputPassword !== user.password)
      return res.status(401).json({ message: "Invalid credentials!" });

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "10m" });
    res.json({ token, user });
  });
};

// **CRUD Operations**
exports.getUsers = (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  db.query(
    "UPDATE users SET username = ?, email = ? WHERE id = ?",
    [username, email, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User updated successfully!" });
    }
  );
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User deleted successfully!" });
  });
};
