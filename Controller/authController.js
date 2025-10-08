import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";

// Utility function to generate JWT and set cookie
const generateTokenAndCookie = (res, userId, userData) => {
  const token = jwt.sign(
    { 
      userId,
      email: userData.email,
      role: userData.role 
    }, 
    process.env.JWT_SECRET || "your_jwt_secret", 
    { expiresIn: "7d" }
  );

  // Set HTTP-only cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

// UNIFIED LOGIN - for both clients and providers
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email (both clients and providers)
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token (both cookie and response)
    const token = generateTokenAndCookie(res, user._id, user);

    console.log('✅ Login successful:', { email: user.email, role: user.role });

    // RETURN TOKEN IN RESPONSE for frontend to store in localStorage
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token, // Frontend stores this in localStorage
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        companyName: user.companyName
      }
    });

  } catch (error) {
    console.log("❌ Error in login:", error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// UNIFIED REGISTER - for both clients and providers
export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    console.log('📝 Registration attempt:', { email, role });

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    // Validate role
    if (!['client', 'provider'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "client" or "provider"'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    };

    // Add company name for providers
    if (role === 'provider' && companyName) {
      userData.companyName = companyName;
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Generate token (both cookie and response)
    const token = generateTokenAndCookie(res, user._id, user);

    console.log('✅ Registration successful:', { email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token, // Frontend stores this in localStorage
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    console.log("❌ Error in registration:", error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// CHECK AUTH STATUS
export const checkAuth = async (req, res) => {
  try {
    // User is attached by authMiddleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePic: req.user.profilePic,
        companyName: req.user.companyName
      }
    });
  } catch (error) {
    console.log("❌ Error in checkAuth:", error.message);
    res.status(500).json({
      success: false,
      message: 'Error checking authentication status'
    });
  }
};

// LOGOUT
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { 
      httpOnly: true,
      expires: new Date(0) 
    });
    
    res.status(200).json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.log("❌ Error in logout:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    
    if (!profilePic) {
      return res.status(400).json({ 
        success: false,
        message: "Profile pic is required" 
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.log("❌ Error in update profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};
