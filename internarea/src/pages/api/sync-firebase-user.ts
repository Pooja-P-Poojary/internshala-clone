import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema);
console.log("SYNC API HIT");


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { uid, email, name, photo } = req.body;
  console.log(req.body);

  if (!uid || !email) {
    return res.status(400).json({ message: "uid and email are required" });
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid: uid });

    if (existingUser) {
      // User already exists, nothing to do
      return res.status(200).json({ message: "User already exists", created: false });
    }

    // Create new MongoDB record for Firebase user
    const newUser = new User({
      firebaseUid: uid,
      email: email,
      name: name || "",
      photo: photo || "",
      password: "", // Firebase users don't have a password
      subscriptionPlan: "FREE",
      applicationsUsed: 0,
      resumes: [],
      lastPasswordReset: "",
    });

    await newUser.save();

    return res.status(201).json({ message: "User created in MongoDB", created: true });

  } catch (error: any) {
    console.error("Sync Firebase user error:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}