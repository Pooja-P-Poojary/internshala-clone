const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
//const nodemailer = require("nodemailer");
const router = express.Router();
const User = require("../Model/User");
const Payment = require("../Model/Payment");
const sendEmail = require("../utils/sendEmail");

console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("SECRET:", process.env.RAZORPAY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const plans = {
  FREE: 0,
  BRONZE: 100,
  SILVER: 300,
  GOLD: 1000,
};

// ─── Create Order ───────────────────────────────────────

router.post("/create-order", async (req, res) => {
  try {
    const { plan } = req.body;

    console.log("Received body:", req.body);

    const indiaTime = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    );

    const hour = indiaTime.getHours();

    if (hour !== 10) {
      return res.status(403).json({
        message: "Payments allowed only between 10 AM and 11 AM IST",
      });
    }

    if (plan === "FREE") {
      return res.status(400).json({
        message: "FREE plan does not require payment",
      });
    }

    if (!plans.hasOwnProperty(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    // Real Razorpay order
    const order = await razorpay.orders.create({
      amount: plans[plan] * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });
    
    res.json(order);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ─── Verify Payment ─────────────────────────────────────
  router.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
    userId,
    email,
  } = req.body;

  try {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }

    // Find or create user
    let user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      user = new User({
        firebaseUid: userId,
        email: email,
        password: "firebase-user",
      });
      await user.save();
    }

    // Update subscription
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    user.subscriptionPlan = plan;
    user.applicationsUsed = 0;
    user.planStartDate = now;
    user.planEndDate = endDate;
    await user.save();

    // Save payment record
    const payment = new Payment({
      userId: user._id,
      plan: plan,
      amount: plans[plan],
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
    await payment.save();

  // Send invoice email
 /* const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});*/

    await sendEmail(
      email,
      "InternArea - Subscription Invoice",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #0055cc; text-align: center;">InternArea Subscription Invoice</h2>
          <hr/>
          <p>Dear User,</p>
          <p>Thank you for subscribing! Your payment was successful.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Plan</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${plan}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Paid</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">₹${plans[plan]}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Plan Start</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${now.toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Plan End</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${endDate.toDateString()}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Applications</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                ${plan === "FREE" ? "1" :
                  plan === "BRONZE" ? "3" :
                  plan === "SILVER" ? "5" :
                  "Unlimited"}/month
              </td>
            </tr>
          </table>
          <hr/>
          <p style="text-align: center; color: #999; font-size: 12px;">
            InternArea © 2025 | All rights reserved
          </p>
        </div>`
    );

    
    return res.status(200).json({
      success: true,
      message: `${plan} plan activated! Invoice sent to email.`,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

// ─── TEST RAZORPAY CONNECTION ─────────────────────

/*router.get("/check-razorpay", async (req, res) => {
  try {

    const result =
      await razorpay.orders.all();

    res.json({
      success: true,
      result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      error,
    });
  }
});*/

router.post("/unsubscribe", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.subscriptionPlan = "FREE";
    user.applicationsUsed = 0;
    user.planStartDate = null;
    user.planEndDate = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Unsubscribed successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
