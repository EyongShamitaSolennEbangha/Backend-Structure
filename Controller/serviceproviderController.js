

import ServiceProvider from "../Models/ServiceProvider.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// CREATE Service Provider (with document info)
export async function createServiceProvider(req, res) {
  try {
    const {
      user_id,
      serviceType,
      description,
      profile_pic,
      rating,
      email,
      password,
      id_card,         // e.g. file path or URL
      passport,        // e.g. file path or URL
      qualifications   // e.g. array of file paths or URLs
    } = req.body;

    // Check if email already exists
    const existing = await ServiceProvider.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newServiceProvider = new ServiceProvider({
      user_id,
      serviceType,
      description,
      profile_pic,
      rating,
      email,
      password: hashedPassword,
      id_card,
      passport,
      qualifications
    });

    const savedServiceProvider = await newServiceProvider.save();
    // Never return password in response
    const { password: pw, ...providerWithoutPassword } = savedServiceProvider.toObject();

    res.status(201).json({
      message: "Service Provider created successfully",
      data: providerWithoutPassword
    });
  } catch (error) {
    console.error("Error creating service provider:", error);
    res.status(500).json({
      message: "Internal server error while creating service provider",
      error: error.message
    });
  }
}

// LOGIN Service Provider
export async function loginServiceProvider(req, res) {
  try {
    const { email, password } = req.body;
    const provider = await ServiceProvider.findOne({ email });
    if (!provider) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Generate JWT
    const token = jwt.sign(
      { id: provider._id, role: "serviceprovider" },
      "your_jwt_secret", // Use env variable in production!
      { expiresIn: "1h" }
    );
    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Error logging in service provider:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
}

// GET all Service Providers
export async function allServiceProvider(req, res) {
  try {
    const providers = await ServiceProvider.find().select("-password");
    res.status(200).json({
      message: "All Service Providers fetched successfully",
      data: providers
    });
  } catch (error) {
    console.error("Error fetching service providers:", error);
    res.status(500).json({
      message: "Internal server error while fetching service providers",
      error: error.message
    });
  }
}

// GET one Service Provider
export async function oneServiceProvider(req, res) {
  try {
    const id = req.params.id;
    const provider = await ServiceProvider.findById(id).select("-password");
    if (!provider) {
      return res.status(404).json({ message: "Service provider not found" });
    }
    res.status(200).json({ data: provider });
  } catch (error) {
    console.error("Error fetching service provider:", error);
    res.status(500).json({
      message: "Internal server error while fetching service provider",
      error: error.message
    });
  }
}

// UPDATE Service Provider
export async function updateServiceProvider(req, res) {
  try {
    const id = req.params.id;
    const updateData = req.body;
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!updatedProvider) {
      return res.status(404).json({ message: "Service provider not found" });
    }
    res.status(200).json({
      message: "Service provider updated successfully",
      data: updatedProvider
    });
  } catch (error) {
    console.error("Error updating service provider:", error);
    res.status(500).json({
      message: "Internal server error while updating service provider",
      error: error.message
    });
  }
}

// DELETE Service Provider
export async function deleteServiceProvider(req, res) {
  try {
    const id = req.params.id;
    const deletedProvider = await ServiceProvider.findByIdAndDelete(id);
    if (!deletedProvider) {
      return res.status(404).json({ message: "Service provider not found" });
    }
    res.status(200).json({
      message: "Service provider deleted successfully",
      data: deletedProvider
    });
  } catch (error) {
    console.error("Error deleting service provider:", error);
    res.status(500).json({
      message: "Internal server error while deleting service provider",
      error: error.message
    });
  }
}



import ServiceProvider from "../Models/ServiceProvider.js";

// Complete service provider profile (after registration)
export async function completeServiceProviderProfile(req, res) {
  try {
    const userId = req.user.userId; // Get from JWT after login
    const {
      serviceType,
      description,
      profile_pic,
      rating,
      id_card,
      passport,
      qualifications
    } = req.body;

    // Update the service provider's profile
    const updatedProvider = await ServiceProvider.findOneAndUpdate(
      { user_id: userId },
      {
        serviceType,
        description,
        profile_pic,
        rating,
        id_card,
        passport,
        qualifications
      },
      { new: true }
    );

    if (!updatedProvider) {
      return res.status(404).json({ message: "Service provider not found" });
    }

    res.status(200).json({
      message: "Service provider profile completed successfully",
      data: updatedProvider
    });
  } catch (error) {
    res.status(500).json({
      message: "Error completing service provider profile",
      error: error.message
    });
  }
}