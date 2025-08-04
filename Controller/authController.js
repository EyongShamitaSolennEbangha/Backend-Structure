import userServer from "../services/user.js";
import user from "../models/User.js";

export async function createUser(req, res) {
  try {
    const userData = req.body;
    const user = await userServer.createUser(userData);
    res.status(201).json({ user: user, message: "user created  successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
}

export async function allUsers(req, res) {
  try {
    const users = await user.find();
    console.log(users);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
}

export async function oneUser(req, res) {
  try {
    const userId = req.params.id;
    const user = await user.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
}

export async function updateUser(req, res) {
  try {
    const updateUser = await user.findByIdAndUpdate(req.params.id, req.body);

    if (!updateUser) {
      return res.status(404).json({ message: "No Updated User Found" });
    }
    res.json({ message: "Updated user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No User Found" });
  }
}

export async function deleteUser(req, res) {
  try {
    const deletedUser = await user.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "User Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "User Not Deleted" });
  }
}
