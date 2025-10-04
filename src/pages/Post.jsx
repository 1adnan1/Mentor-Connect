import TopNav from "../components/TopNav";
import LeftBar from "../components/LeftBar";
import { useEffect, useState } from "react";
import { db, auth } from "../components/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [inputText, setInputText] = useState("");
  const [user, setUser] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      if (!selectedPostId && snapshot.docs.length > 0) {
        setSelectedPostId(snapshot.docs[0].id);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedPostId) {
      const q = query(
        collection(db, "posts", selectedPostId, "comments"),
        orderBy("createdAt", "asc")
      );
      return onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map((doc) => doc.data()));
      });
    }
  }, [selectedPostId]);

  const handleAddPost = async () => {
    if (!user || !inputText.trim()) return;
  
    try {
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
  
      const fullName = `${userData.firstName || "Anonymous"} ${userData.lastName || ""}`;
  
      await addDoc(collection(db, "posts"), {
        author: fullName,
        description: inputText,
        createdAt: serverTimestamp(),
      });
  
      // ✅ Add notification automatically
      await addDoc(collection(db, "notifications"), {
        message: `📝 New post by ${fullName}`,
        timestamp: serverTimestamp(),
        read: false,
      });
  
      setInputText("");
    } catch (error) {
      console.error("Post Error:", error);
    }
  };
  

  const handleCommentSubmit = async () => {
    if (!user || !inputText.trim() || !selectedPostId) return;

    try {
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      await addDoc(collection(db, "posts", selectedPostId, "comments"), {
        text: inputText,
        author: `${userData.firstName || "Anonymous"} ${userData.lastName || ""}`,
        createdAt: serverTimestamp(),
      });

      setInputText("");
    } catch (err) {
      console.error("Comment Error:", err);
    }
  };

  return (
    <>
      <TopNav />

      <div className="flex bg-gray-100 min-h-[100vh]">
        <div className="w-1/5 bg-white shadow-md flex flex-col h-[100vh]">
          <LeftBar />
        </div>

        {/* Middle Section - Posts */}
        <div className="w-3/5 p-6 space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-700">{post.author}</h4>
                  <p className="text-xs text-gray-500">
                    {post.createdAt?.toDate().toLocaleString() || "Just now"}
                  </p>
                </div>
                <p className="text-gray-800 mb-2">{post.description}</p>
                <div className="text-sm text-gray-500 flex gap-4">
                  <span>🗨 {selectedPostId === post.id ? comments.length : "comments"}</span>
                  <button
                    onClick={() => setSelectedPostId(post.id)}
                    className="text-blue-500 font-semibold"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No posts yet...</p>
          )}
        </div>

        {/* Right Section - Comments */}
        <div className="w-1/5 bg-white border-l flex flex-col h-[100vh] p-4">
          <div className="flex-1 overflow-y-auto pr-1">
            <h3 className="font-bold text-lg mb-3">Comments</h3>
            <div className="space-y-3 text-sm">
              {comments.length > 0 ? (
                comments.map((c, i) => (
                  <div key={i} className="bg-gray-100 p-2 rounded">
                    <strong className="text-blue-600">{c.author}</strong> – {c.text}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">No comments yet...</p>
              )}
            </div>

            {/* Bottom - Input */}
            <div className="mt-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type something..."
                className="w-full px-3 py-2 border rounded mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCommentSubmit}
                  className="w-1/2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Submit
                </button>
                <button
                  onClick={handleAddPost}
                  className="w-1/2 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
