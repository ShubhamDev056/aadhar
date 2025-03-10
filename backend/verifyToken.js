const jwt = require("jsonwebtoken");

const JWT_SECRET = "056Shubhamdev"; // Replace with your actual secret key

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Assumes 'Bearer <token>' format
  if (!token) {
    return res
      .status(401)
      .json({ message: "Token missing from authorization header." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user data to the request
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

module.exports = verifyToken;
