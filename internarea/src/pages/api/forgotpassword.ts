import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import sendEmail from "../../lib/sendEmail";

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const generatePassword = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const sendPasswordEmail = async (toEmail: string, newPassword: string) => {

  await sendEmail(
    toEmail,
    "Your Password Has Been Reset - InternArea",
    `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #005aff;">InternArea - Password Reset</h2>
        <p>Your password has been successfully reset.</p>
        <p style="font-size: 18px;">Your new password is:</p>
        <div style="background: #f0f9ff; border: 1px solid #0099ff; padding: 15px; border-radius: 8px; text-align: center;">
          <strong style="font-size: 24px; color: #0055cc; letter-spacing: 2px;">${newPassword}</strong>
        </div>
        <p style="color: red; margin-top: 15px;">⚠️ Please log in and change this password immediately.</p>
        <p style="color: #666; font-size: 13px;">If you did not request this reset, please contact support.</p>
      </div>`
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: "Email or phone is required" });
  }

  try {
    console.log("Handler reached, identifier:", identifier);
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check once per day limit
    const today = new Date().toDateString();
    if (user.lastPasswordReset === today) {
      return res.status(429).json({
        message: "You can use this option only once per day.",
      });
    }

    // Check email exists on user
    if (!user.email) {
      return res.status(400).json({ message: "No email linked to this account" });
    }

    const newPassword = generatePassword();
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.lastPasswordReset = today;
    await user.save();

    // Send email
    console.log("Attempting to send email to:", user.email);
    await sendPasswordEmail(user.email, newPassword);

    return res.status(200).json({
      message: "Password reset successful. New password sent to your email.",
    });

  } catch (error: any) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}