const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName:   String,
    phone:      String,
    location:   String,
    linkedin:   String,
    photoUrl:   String,
    summary:    String,

    education: [
      {
        degree:      String,
        institution: String,
        year:        String,
        grade:       String,
      },
    ],

    experience: [
      {
        title:       String,
        company:     String,
        duration:    String,
        location:    String,
        description: String,
      },
    ],

    skills:         [String],   // ["React", "Node.js", "Python"]
    certifications: String,

    paymentId: String,
    paymentStatus: {
      type:    String,
      enum:    ["PENDING", "PAID"],
      default: "PENDING",
    },
    amountPaid: {
      type:    Number,
      default: 50,
    },

    resumeUrl:         String,
    attachedToProfile: { type: Boolean, default: false },
  },
  {
    timestamps: true,   // auto createdAt + updatedAt
  }
);

module.exports = mongoose.model("Resume", ResumeSchema);