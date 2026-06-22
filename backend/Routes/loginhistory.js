const express = require("express");
const router = express.Router();
const LoginHistory = require("../Model/LoginHistory");
const nodemailer = require("nodemailer");

// Store OTPs temporarily
const otpStore = {};

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for Chrome login
const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family:4,
    tls: {
    rejectUnauthorized: false
  },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "InternArea - Login OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0055cc; text-align: center;">🔐 Login Verification</h2>
        <p>A login attempt was made from <strong>Google Chrome</strong>.</p>
        <p>Your OTP is:</p>
        <h1 style="text-align: center; color: #0055cc; letter-spacing: 10px; font-size: 40px;">
          ${otp}
        </h1>
        <p style="color: #999; font-size: 12px;">This OTP expires in 5 minutes.</p>
      </div>
    `,
  });
};

// POST /api/loginhistory/save
router.post("/save", async (req, res) => {
  const { userId, email, browser, os, deviceType } = req.body;

  // Get real IP address
  const ipAddress = 
    req.headers["x-forwarded-for"] || 
    req.socket.remoteAddress || 
    "Unknown";

  try {
    // Rule 1: Mobile device time restriction (10AM - 1PM)
    if (deviceType === "mobile") {
      const now = new Date();
      const istTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
      const hour = istTime.getHours();

      if (hour < 10 || hour >= 13) {
        // Save blocked attempt
        await LoginHistory.create({
          userId,
          email,
          browser,
          os,
          deviceType,
          ipAddress,
          status: "blocked",
        });

        return res.status(403).json({
          success: false,
          blocked: true,
          message: "Mobile login only allowed between 10:00 AM and 1:00 PM IST",
        });
      }
    }

    // Rule 2: Chrome requires OTP
    if (browser === "Chrome") {
      const otp = generateOTP();
      otpStore[email] = {
        otp,
        expiry: Date.now() + 5 * 60 * 1000,
        loginData: { userId, email, browser, os, deviceType, ipAddress },
      };

      await sendOTP(email, otp);

      return res.status(200).json({
        success: true,
        otpRequired: true,
        message: "OTP sent to your email for Chrome login verification",
      });
    }

    // Save login history for other browsers
    await LoginHistory.create({
      userId,
      email,
      browser,
      os,
      deviceType,
      ipAddress,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      otpRequired: false,
      message: "Login recorded successfully",
    });

  } catch (error) {
    console.log("Login history error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

// POST /api/loginhistory/verify-otp
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const stored = otpStore[email];

  if (!stored) {
    return res.status(400).json({
      success: false,
      message: "OTP not found. Please login again.",
    });
  }

  if (Date.now() > stored.expiry) {
    delete otpStore[email];
    return res.status(400).json({
      success: false,
      message: "OTP expired. Please login again.",
    });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP!",
    });
  }

  // Save login history after OTP verified
  const { loginData } = stored;
  await LoginHistory.create({
    ...loginData,
    status: "success",
  });

  delete otpStore[email];

  return res.status(200).json({
    success: true,
    message: "OTP verified! Login successful.",
  });
});

// GET /api/loginhistory/:userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await LoginHistory.find({ userId })
      .sort({ loginTime: -1 })
      .limit(20);

    return res.status(200).json({ success: true, history });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

module.exports = router;