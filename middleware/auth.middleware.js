import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('🔐 Message Route Auth Check:');
    console.log('📤 Authorization Header:', req.headers.authorization);
    console.log('🔑 Token exists:', !!token);

    if (!token) {
      return res.status(401).json({ 
        message: "Not authorized, no token" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        message: "User not found" 
      });
    }

    req.user = user;
    console.log('✅ User authenticated for messages:', user.email);
    
    next();
  } catch (error) {
    console.log("❌ Error in protectRoute:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expired" 
      });
    }

    res.status(500).json({ 
      message: "Server error" 
    });
  }
};
