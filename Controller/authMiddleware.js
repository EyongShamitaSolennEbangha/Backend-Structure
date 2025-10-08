import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
      console.log('🔑 Token from Authorization header');
    }

    console.log('🔐 Auth Middleware Debug:');
    console.log('📋 Request URL:', req.url);
    console.log('📤 Authorization Header:', req.headers.authorization);
    console.log('🔑 Token exists:', !!token);

    if (!token) {
      console.log('❌ No JWT token found');
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated. Please log in." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    console.log('✅ Token decoded successfully:', decoded);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ 
        success: false,
        message: "User not found. Please log in again." 
      });
    }

    // Attach user to request - adjusted for services
    req.user = {
      id: user._id,
      userId: user._id,
      _id: user._id, // Added for services compatibility
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    console.log('👤 User attached to request for services:', {
      id: req.user.id,
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role
    });
    
    next();
  } catch (error) {
    console.log("❌ Error in authMiddleware:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please log in again." 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. Please log in again." 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: "Authentication error" 
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ Role ${req.user.role} not authorized for services. Allowed roles:`, allowedRoles);
      return res.status(403).json({ 
        success: false,
        message: "Access denied: Provider access required" 
      });
    }

    console.log(`✅ Role ${req.user.role} authorized for services:`, allowedRoles);
    next();
  };
};
