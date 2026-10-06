import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // JWT authentication logic will go here
    const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({
    message: "Not authorized, no token",
  });
}

const token = authHeader.split(" ")[1];
const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET
);

console.log(decoded);
const user = await User.findById(decoded.userId);

if (!user) {
  return res.status(401).json({
    message: "User not found",
  });
}

req.user = user;
next();
  } catch (error) {
    res.status(401).json({
      message: "Not authorized",
    });
  }
};

export default authMiddleware;