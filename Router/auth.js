import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Generate token function
const generateToken = (userId, userData) => {
  return jwt.sign(
    { 
      userId,
      email: userData.email,
      role: userData.role 
    }, 
    process.env.JWT_SECRET || "your_jwt_secret", 
    { expiresIn: "7d" }
  );
};

// REGISTER - FIXED
router.post("/register", async (req, res) => {
  try {
    console.log("🔐 Register attempt:", req.body);
    
    const { firstName, lastName, email, password, role } = req.body;
    
    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required including role" 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();
    console.log("✅ User saved to database:", savedUser._id);

    // Generate token
    const token = generateToken(savedUser._id, savedUser);

    // Success response - RETURN TOKEN
    res.status(201).json({
      success: true,
      message: "User created successfully",
      token: token, // ✅ This is crucial
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        role: savedUser.role,
      }
    });

  } catch (error) {
    console.log("❌ Register error:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Server error during registration: " + error.message 
    });
  }
});

// LOGIN - FIXED
router.post("/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email);
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user
    const foundUser = await User.findOne({ email: email.toLowerCase() });
    if (!foundUser) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Generate token
    const token = generateToken(foundUser._id, foundUser);
    console.log("✅ Login successful for:", foundUser.email);
    console.log("🔑 Token generated:", token ? "YES" : "NO");

    // Success response - RETURN TOKEN
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token, // ✅ This is crucial
      user: {
        id: foundUser._id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        role: foundUser.role,
      },
    });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server error during login: " + err.message 
    });
  }
});

// CHECK AUTH STATUS
router.get("/check", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.log("❌ Auth check error:", error.message);
    res.status(401).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Logged out successfully" 
  });
});

export default router;
