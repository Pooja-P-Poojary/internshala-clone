const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

// Store OTPs temporarily
const otpStore = {};

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const otp = generateOTP();

    // Store OTP with expiry (5 minutes)
    otpStore[email] = {
      otp,
      expiry: Date.now() + 5 * 60 * 1000,
    };

    // Send email
    await sendEmail(
      email,
      "InternArea - French Language Verification OTP",
      `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #0055cc; text-align: center;">🇫🇷 Language Verification</h2>
          <p>You are switching the website language to <strong>French</strong>.</p>
          <p>Your OTP is:</p>
          <h1 style="text-align: center; color: #0055cc; letter-spacing: 10px; font-size: 40px;">
            ${otp}
          </h1>
          <p style="color: #999; font-size: 12px;">This OTP expires in 5 minutes.</p>
        </div>`
    );


    return res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
    });

  } catch (error) {
    console.log("OTP send error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const stored = otpStore[email];

  if (!stored) {
    return res.status(400).json({
      success: false,
      message: "OTP not found. Please request again.",
    });
  }

  if (Date.now() > stored.expiry) {
    delete otpStore[email];
    return res.status(400).json({
      success: false,
      message: "OTP expired. Please request again.",
    });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP!",
    });
  }

  // OTP correct - delete from store
  delete otpStore[email];

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully!",
  });
});

module.exports = router;