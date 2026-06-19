const express = require("express");
const router = express.Router();
const Post = require("../Model/Post");
const User = require("../Model/User");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST create post
router.post("/", upload.single("media"), async (req, res) => {
  try {
    const { userId, username, userPhoto, text, mediaType } = req.body;

    // ─── Check posting limit based on friend count ───
    const user = await User.findOne({ firebaseUid: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const friendsCount = user.friends.length;

    if (friendsCount === 0) {
      return res.status(403).json({
        success: false,
        message: "Add friends to start posting!",
      });
    }

    const today = new Date().toDateString();

    // Reset counter if it's a new day
    if (user.lastPostDate !== today) {
      user.postsToday = 0;
      user.lastPostDate = today;
    }

    // Determine daily limit
    const dailyLimit = friendsCount > 10 ? Infinity : friendsCount;

    if (user.postsToday >= dailyLimit) {
      return res.status(429).json({
        success: false,
        message: `You can post ${dailyLimit} time(s) per day. Add more friends to post more!`,
      });
    }

    let mediaUrl = "";

    // Upload to Cloudinary if media exists
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const resourceType = mediaType?.startsWith("video/") ? "video" : "image";
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: resourceType },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      mediaUrl = uploadResult.secure_url;
    }

    const post = new Post({
      userId,
      username,
      userPhoto,
      text,
      mediaUrl,
      mediaType: mediaType || "",
    });

    await post.save();

    // Increment post count for today
    user.postsToday += 1;
    await user.save();
    
    return res.status(200).json({ success: true, post });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT like/unlike post
router.put("/like/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likedBy.includes(userId)) {
      // Unlike
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes -= 1;
    } else {
      // Like
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();
    return res.status(200).json({ success: true, post });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST add comment
router.post("/comment/:id", async (req, res) => {
  try {
    const { userId, username, text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ userId, username, text });
    await post.save();

    return res.status(200).json({ success: true, post });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST add friend (mutual)
router.post("/addfriend", async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ success: false, message: "userId and friendId required" });
    }

    if (userId === friendId) {
      return res.status(400).json({ success: false, message: "Cannot add yourself as friend" });
    }

    const user = await User.findOne({ firebaseUid: userId });
    const friend = await User.findOne({ firebaseUid: friendId });

    if (!user || !friend) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
      await user.save();
    }

    if (!friend.friends.includes(userId)) {
      friend.friends.push(userId);
      await friend.save();
    }

    return res.status(200).json({
      success: true,
      message: "Friend added!",
      friendsCount: user.friends.length,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
// GET search users by name
router.get("/search-users", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(200).json({ success: true, users: [] });
    }

    const users = await User.find({
      name: { $regex: query, $options: "i" },
    }).limit(10).select("firebaseUid name email");

    return res.status(200).json({ success: true, users });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE post
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;