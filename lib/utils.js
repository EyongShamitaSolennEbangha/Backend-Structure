import jwt from "jsonwebtoken";

export const generateToken = (res, userId) => {
  // Step 1: Create JWT token with user ID
  const token = jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || "your_jwt_secret", 
    { expiresIn: "7d" } // Token valid for 7 days
  );

  // Step 2: Set HTTP-only cookie (extra security)
  res.cookie("jwt", token, {
    httpOnly: true,    // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: "lax",   // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Step 3: Return token for frontend storage
  return token;
};
