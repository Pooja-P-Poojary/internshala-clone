const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  // Personal Info
  fullName:    { type: String },
  phone:       { type: String },
  location:    { type: String },
  linkedin:    { type: String },
  photoUrl:    { type: String },
  summary:     { type: String },

  // Qualifications
  education: [
    {
      degree:      { type: String },
      institution: { type: String },
      year:        { type: String },
      grade:       { type: String },
    }
  ],

  // Experience
  experience: [
    {
      title:    { type: String },
      company:  { type: String },
      duration: { type: String },
      location: { type: String },
      description: { type: String },
    }
  ],

  skills:           { type: String },
  certifications:   { type: String },

  // Payment & status
  paymentId:        { type: String },      // Razorpay payment ID
  paymentStatus:    { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
  amountPaid:       { type: Number, default: 50 },

  // Generated resume
  resumeUrl:        { type: String },      // Link / PDF path once generated
  attachedToProfile: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  email:    { type: String },
  firebaseUid: { type: String },
  phone:    { type: String },
  password: { type: String, default: "" },
  lastPasswordReset: { type: String, default: "" },

  friends: [{ type: String }],      // array of firebaseUids
  postsToday: { type: Number, default: 0 },
  lastPostDate: { type: String, default: "" },

  subscriptionPlan: {
    type: String,
    enum: ["FREE", "BRONZE", "SILVER", "GOLD"],
    default: "FREE",
  },

  applicationsUsed: { type: Number, default: 0 },
  planStartDate:    { type: Date },
  planEndDate:      { type: Date },

  // ── Resume Builder (Premium) ──────────────────────────────────
  resumes: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "Resume"
}],          // all resumes the user has generated

  // OTP for resume payment verification
  resumeOtp: {
    code:      { type: String },         // 6-digit OTP (store hashed in production)
    expiresAt: { type: Date },           // 10 min from generation
    verified:  { type: Boolean, default: false },
  },


loginOtp: {
  code: {type: String },
  expiresAt: {type: Date },
  verified: {type:Boolean} ,
}
});


module.exports = mongoose.model("User", UserSchema);