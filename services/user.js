import  User  from "../Models/User.js";
import { hash } from "bcrypt";

const createUser = async (userData) => {
  const hashedPassword = await hash(userData.password, 10);
  const newUser = new User({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: userData.role
  });
  const savedUser = await newUser.save();
  return savedUser;
};


export default  { createUser };

