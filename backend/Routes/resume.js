const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Resume = require("../Model/Resume");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const sendEmail = require("../Utils/sendEmail");

// ── Razorpay instance ──────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ── POST /resume/send-otp ─────────────────────────────────────
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Premium plan check
    if (user.subscriptionPlan === "FREE") {
      return res.status(403).json({
        message: "Resume Builder is available on Premium plans only",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resumeOtp = {
      code:      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified:  false,
    };
    await user.save();

    await sendEmail(
      email,
      "InternHub — Resume Builder OTP",
      `<h2>Your OTP for Resume Builder</h2>
       <p>Use the code below to verify your email before payment.</p>
       <h1 style="letter-spacing:8px;">${otp}</h1>
       <p>Valid for <strong>10 minutes</strong>. Do not share this with anyone.</p>`
    );


    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ── POST /resume/verify-otp ───────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { code, expiresAt, verified } = user.resumeOtp || {};

    if (!code) {
      return res.status(400).json({ message: "No OTP found. Please request a new one" });
    }
    if (verified) {
      return res.status(400).json({ message: "OTP already used" });
    }
    if (new Date() > new Date(expiresAt)) {
      return res.status(400).json({ message: "OTP expired. Please request a new one" });
    }
    if (code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.resumeOtp.verified = true;
    await user.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ── POST /resume/create-order ─────────────────────────────────
// Creates a Razorpay order after OTP is verified
router.post("/create-order", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Block if OTP not verified
    if (!user.resumeOtp?.verified) {
      return res.status(403).json({ message: "Email not verified. Please verify OTP first" });
    }

    const order = await razorpay.orders.create({
      amount:   5000,       // ₹50 in paise
      currency: "INR",
      receipt: `resume_${Date.now()}`
    });

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ── POST /resume/verify-payment ───────────────────────────────
// Called after Razorpay payment succeeds on frontend
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      email,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      resumeData,           // full form data from frontend
    } = req.body;

    // 1. Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Create Resume document
    const resume = new Resume({
      userId:            user._id,
      fullName:          resumeData.fullName,
      phone:             resumeData.phone,
      location:          resumeData.location,
      linkedin:          resumeData.linkedin,
      photoUrl:          resumeData.photoUrl,
      summary:           resumeData.summary,
      education:         resumeData.education,
      experience:        resumeData.experience,
      skills:            resumeData.skills,
      certifications:    resumeData.certifications,
      paymentId:         razorpay_payment_id,
      paymentStatus:     "PAID",
      amountPaid:        50,
      attachedToProfile: true,
    });
    await resume.save();

    // 4. Link resume to user & clear OTP
    user.resumes.push(resume._id);
    user.resumeOtp = { code: null, expiresAt: null, verified: false };
    await user.save();

    res.json({
      success:  true,
      message:  "Payment verified. Resume saved and attached to profile",
      resumeId: resume._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ── GET /resume/my-resumes ────────────────────────────────────
router.get("/my-resumes", async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resumes = await Resume.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({ success: true, resumes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ── GET /resume/:id ───────────────────────────────────────────
const mongoose = require("mongoose");
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }

    const resume = await Resume.findById(id).populate("userId", "email phone");
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json({ success: true, resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;