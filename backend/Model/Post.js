const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String },
  userPhoto: { type: String },
  text: { type: String, default: "" },
  mediaUrl: { type: String, default: "" },
  mediaType: { type: String, default: "" },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  comments: [{ 
    text: { type: String },
    userId: { type: String },
    username: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", PostSchema);