import jwt from "jsonwebtoken";
import User from "../models/User.js";

// JWT Authentication middleware 
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header is present
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    // Expect exactly: "Bearer <token>"
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Malformed authorization header" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    
    next();

  } catch (error) {
    console.error("JWT verification error:", error.message);

    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
};

// Authorization/Permission Middleware 
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // console.log("Authorizing user with role:", req.user.role, "against allowed roles:", roles);
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions" });
    }
    next();
  };
};

// Admin-Only Authentication Middleware
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required" });
  }
  next();
};

export default {
  authorize,
  authenticate,
  adminOnly,
};
