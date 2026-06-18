const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID
    required: true,
  },
  email: {
    type: String,
  },
  browser: {
    type: String,
  },
  os: {
    type: String,
  },
  deviceType: {
    type: String, // desktop, laptop, mobile
  },
  ipAddress: {
    type: String,
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["success", "blocked"],
    default: "success",
  },
});

module.exports = mongoose.model("LoginHistory", LoginHistorySchema);