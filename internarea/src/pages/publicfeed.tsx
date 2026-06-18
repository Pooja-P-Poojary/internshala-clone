import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectuser } from "../Feature/Userslice";
import { useLanguage } from "../Context/language_context";

export default function PublicFeed() {
  const user = useSelector(selectuser);
  const { t } = useLanguage();
  const [postText, setPostText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePost, setSharePost] = useState<any>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [friendMessage, setFriendMessage] = useState("");
  const [postError, setPostError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/post");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.log("Error fetching posts:", error);
    }
  };

  const handlePost = async () => {
    if (postText.trim() === "" && !mediaFile) return;
    if (!user) {
      alert(t("loginToPost"));
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", user.uid);
      formData.append("username", user.name || "User");
      formData.append("userPhoto", user.photo || "");
      formData.append("text", postText);
      if (mediaFile) {
        formData.append("media", mediaFile);
        formData.append("mediaType", mediaType);
      }
      const res = await fetch("http://localhost:5000/api/post", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPosts([data.post, ...posts]);
        setPostText("");
        setMediaFile(null);
        setMediaPreview("");
        setMediaType("");
        setPostError("");
      } else {
        setPostError(data.message);
      }
    } catch (error) {
      console.log("Error creating post:", error);
    }
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      alert(t("loginToLike"));
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/post/like/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map(p => p._id === postId ? data.post : p));
      }
    } catch (error) {
      console.log("Error liking post:", error);
    }
  };

  const handleComment = (postId: string) => {
    setPosts(posts.map(p =>
      p._id === postId ? { ...p, showComment: !p.showComment } : p
    ));
  };

  const submitComment = async (postId: string) => {
    if (commentText.trim() === "") return;
    if (!user) {
      alert(t("loginToComment"));
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/post/comment/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          username: user.name || "User",
          text: commentText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map(p => p._id === postId ? { ...data.post, showComment: true } : p));
        setCommentText("");
      }
    } catch (error) {
      console.log("Error commenting:", error);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/post/${postId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter(p => p._id !== postId));
        setShowMenu(null);
      }
    } catch (error) {
      console.log("Error deleting post:", error);
    }
  };

  const handleShare = (post: any) => {
    setSharePost(post);
    setShowShareModal(true);
  };

  const handleAddFriend = async (friendId: string) => {
    if (!user) {
      alert(t("loginToAddFriend"));
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/post/addfriend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, friendId }),
      });
      const data = await res.json();
      if (data.success) {
        setFriendMessage("✅ " + t("friendAdded"));
      } else {
        setFriendMessage("❌ " + data.message);
      }
    } catch (error) {
      setFriendMessage("❌ " + t("somethingWentWrong"));
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", color: "#1a1a1a" }}>
      <h1 style={{ color: "#0f3460", fontSize: "28px", marginBottom: "10px" }}>{t("publicFeed")}</h1>

      {friendMessage && (
        <p style={{
          textAlign: "center",
          fontWeight: "bold",
          color: friendMessage.includes("✅") ? "green" : "red",
          marginBottom: "10px"
        }}>
          {friendMessage}
        </p>
      )}

      {/* Create Post Box */}
      <div style={{ border: "1px solid #0f3460", borderRadius: "10px", padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
        <p style={{ fontWeight: "bold", color: "#0f3460", marginBottom: "10px" }}>✏️ {t("createPost")}</p>

        <textarea
          placeholder={t("writePost")}
          rows={4}
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          style={{ width: "100%", padding: "10px", marginTop: "20px", color: "#1a1a1a", border: "1px solid #ccc", borderRadius: "8px", fontSize: "14px", resize: "none" }}
        />

        {mediaPreview && mediaType.startsWith("video/") ? (
          <video src={mediaPreview} controls style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }} />
        ) : mediaPreview ? (
          <img src={mediaPreview} style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }} />
        ) : null}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
          <label style={{ fontWeight: "bold", color: "#0f3460", cursor: "pointer", fontSize: "14px" }}>
            📎 {t("addMedia")}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setMediaFile(file);
                  setMediaType(file.type);
                  setMediaPreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>

          <button
            onClick={handlePost}
            disabled={loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ padding: "10px 20px", cursor: "pointer", color: "white", backgroundColor: isHovered ? "#16213e" : "#0f3460", border: "none", borderRadius: "5px", fontSize: "14px", fontWeight: "bold", transition: "background-color 0.2s", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? t("posting") : t("createPost")}
          </button>
        </div>
      </div>

      {postError && (
        <p style={{ color: "red", marginTop: "10px", fontWeight: "bold", fontSize: "14px" }}>
          ⚠️ {postError}
        </p>
      )}

      {/* Posts List */}
      {posts.map((post) => (
        <div key={post._id} style={{ border: "1px solid #ddd", borderRadius: "10px", marginBottom: "20px", backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {post.userPhoto ? (
                <img src={post.userPhoto} style={{ width: "42px", height: "42px", borderRadius: "50%" }} />
              ) : (
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#0f3460", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
                  {post.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <p style={{ fontWeight: "bold", margin: 0, color: "#000" }}>{post.username || "User"}</p>
            </div>

            {user?.uid === post.userId && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowMenu(showMenu === post._id ? null : post._id)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#555", padding: "4px 8px" }}
                >
                  ⋮
                </button>
                {showMenu === post._id && (
                  <div style={{ position: "absolute", right: 0, top: "30px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "120px" }}>
                    <button
                      onClick={() => handleDelete(post._id)}
                      style={{ width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", color: "red", textAlign: "left", fontSize: "14px", fontWeight: "bold" }}
                    >
                      🗑️ {t("deletePost")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {user && user.uid !== post.userId && (
              <button
                onClick={() => handleAddFriend(post.userId)}
                style={{ padding: "6px 12px", borderRadius: "5px", cursor: "pointer", border: "1px solid #0f3460", backgroundColor: "#fff", color: "#0f3460", fontWeight: "bold", fontSize: "13px" }}
              >
                ➕ {t("addFriend")}
              </button>
            )}
          </div>

          {post.text !== "" && (
            <p style={{ margin: "0 16px 12px 16px", fontSize: "14px", color: "#333" }}>
              {post.text}
            </p>
          )}

          {post.mediaUrl && (
            <>
              {post.mediaType?.startsWith("video/") ? (
                <video src={post.mediaUrl} controls style={{ width: "100%", borderRadius: "8px", marginBottom: "10px", display: "block" }} />
              ) : (
                <img src={post.mediaUrl} alt="post" style={{ width: "100%", borderRadius: "8px", marginBottom: "10px", display: "block" }} />
              )}
            </>
          )}

          <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", display: "flex", gap: "12px" }}>
            <button
              onClick={() => handleLike(post._id)}
              style={{ padding: "8px 20px", borderRadius: "5px", cursor: "pointer", border: "1px solid #ddd", backgroundColor: post.likedBy?.includes(user?.uid) ? "#e8f0ff" : "#f0f0f0", fontWeight: "bold", color: "#000" }}
            >
              👍 {t("like")} {post.likes > 0 ? post.likes : ""}
            </button>
            <button
              onClick={() => handleComment(post._id)}
              style={{ padding: "8px 20px", borderRadius: "5px", cursor: "pointer", border: "1px solid #ddd", backgroundColor: "#f0f0f0", fontWeight: "bold", color: "#000" }}
            >
              💬 {t("comment")}
            </button>
            <button
              onClick={() => handleShare(post)}
              style={{ padding: "8px 20px", borderRadius: "5px", cursor: "pointer", border: "1px solid #ddd", backgroundColor: "#f0f0f0", fontWeight: "bold", color: "#000" }}
            >
              🔗 {t("share")}
            </button>
          </div>

          {post.showComment && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #eee" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  placeholder={t("writeComment")}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{ padding: "8px", flex: 1, border: "1px solid #ccc", borderRadius: "5px", color: "#000" }}
                />
                <button
                  onClick={() => submitComment(post._id)}
                  style={{ padding: "8px 14px", cursor: "pointer", backgroundColor: "#0f3460", color: "white", border: "none", borderRadius: "5px" }}
                >
                  {t("post")}
                </button>
              </div>
              {post.comments?.map((c: any, i: number) => (
                <p key={i} style={{ marginTop: "8px", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "5px", color: "#000" }}>
                  💬 <strong>{c.username}:</strong> {c.text}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Share Modal */}
      {showShareModal && sharePost && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", width: "350px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <h3 style={{ color: "#000", marginBottom: "20px", fontWeight: "bold" }}>{t("sharePost")}</h3>
            <p style={{ color: "#555", fontSize: "14px", marginBottom: "20px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
              {sharePost.text?.substring(0, 100)}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href={"https://wa.me/?text=" + encodeURIComponent(sharePost.text + " - Shared from InternArea")} target="_blank" rel="noopener noreferrer" style={{ padding: "12px", backgroundColor: "#25D366", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
                📱 {t("shareWhatsapp")}
              </a>
              <a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(sharePost.text + " - Shared from InternArea")} target="_blank" rel="noopener noreferrer" style={{ padding: "12px", backgroundColor: "#000000", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
                🐦 {t("shareTwitter")}
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" style={{ padding: "12px", backgroundColor: "#E1306C", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
                📸 {t("openInstagram")}
              </a>
              <button onClick={() => { navigator.clipboard.writeText(window.location.origin + "/publicfeed"); alert(t("linkCopied")); }} style={{ padding: "12px", backgroundColor: "#0055cc", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                🔗 {t("copyLink")}
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} style={{ marginTop: "15px", width: "100%", padding: "10px", backgroundColor: "#f5f5f5", color: "#333", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}