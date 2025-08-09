import user from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Registration (Sign Up)
export async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = new user({
      name,
      email,
      password: hashedPassword,
      role,
    });
    const savedUser = await newUser.save();

    // Never return password in response
    const { password: pw, ...userWithoutPassword } = savedUser.toObject();

    res.status(201).json({ user: userWithoutPassword, message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
}

// User Login
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const foundUser = await user.findOne({ email });
    if (!foundUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: foundUser._id, role: foundUser.role },
      "your_jwt_secret", // Replace with env variable in production!
      { expiresIn: "1h" }
    );

    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
}

// Example: Protecting a route with JWT
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Other CRUD operations (unchanged, but you can protect them with authMiddleware)
export async function allUsers(req, res) {
  try {
    const users = await user.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
}

export async function oneUser(req, res) {
  try {
    const userId = req.params.id;
    const foundUser = await user.findById(userId).select("-password");
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(foundUser);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
}

export async function updateUser(req, res) {
  try {
    const updateUser = await user.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    if (!updateUser) {
      return res.status(404).json({ message: "No Updated User Found" });
    }
    res.json({ message: "Updated user", user: updateUser });
  } catch (error) {
    res.status(500).json({ message: "No User Found" });
  }
}

export async function deleteUser(req, res) {
  try {
    const deletedUser = await user.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "User Deleted" });
  } catch (error) {
    res.status(500).json({ message: "User Not Deleted" });
  }
}