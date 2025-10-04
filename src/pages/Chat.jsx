import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../components/firebase";
import {
  FaHome,
  FaUserFriends,
  FaComments,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import TopNav from "../components/TopNav";
import LeftBar from "../components/LeftBar";

const Chat = () => {
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const authInstance = getAuth();

  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState("all_chat");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/signin");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "Users"));
      const usersList = usersSnapshot.docs
        .map((doc) => ({ uid: doc.id, ...doc.data() }))
        .filter((u) => u.uid !== user?.uid);
      setAllUsers(usersList);
    };
    if (user) fetchUsers();
  }, [user]);

  useEffect(() => {
    if (selectedUser && user) {
      const id =
        user.uid < selectedUser.uid
          ? `${user.uid}_${selectedUser.uid}`
          : `${selectedUser.uid}_${user.uid}`;
      setChatId(id);
    } else {
      setChatId("all_chat");
    }
  }, [selectedUser, user]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "messages", chatId, "chat"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;
    try {
      const userSnap = await getDocs(collection(db, "Users"));
      const currentUser = userSnap.docs.find((doc) => doc.id === user.uid)?.data();
      const role = currentUser?.role || "User";

      await addDoc(collection(db, "messages", chatId, "chat"), {
        text: newMessage,
        sender: user?.uid,
        senderName: user?.displayName || `${currentUser.firstName} ${currentUser.lastName}`,
        senderRole: role, // ✅ Added role
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    try {
      await signOut(authInstance);
      toast.info("Logged out successfully!", { position: "top-center" });
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed!");
    }
  };

  return (
    <>
      <TopNav />
      <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-md h-screen">
  <LeftBar />
</aside>


        {/* Chat Panel */}
        <main className="flex-1 flex flex-col p-6 gap-4">
          <div className="bg-white shadow rounded-xl flex h-full">
            {/* User List */}
            <div className="w-1/3 border-r p-4 space-y-3 overflow-y-auto">
              <h2 className="text-lg font-semibold">Chats</h2>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Search users..."
              />
              <div
                onClick={() => setSelectedUser(null)}
                className={`p-2 rounded-md cursor-pointer ${
                  !selectedUser ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                }`}
              >
                🌍 All Chat
              </div>
              {allUsers.map((u) => (
                <div
                  key={u.uid}
                  onClick={() => setSelectedUser(u)}
                  className={`p-2 rounded-md cursor-pointer ${
                    selectedUser?.uid === u.uid
                      ? "bg-blue-100 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {u.firstName + " " + u.lastName}
                </div>
              ))}
            </div>

            {/* Chat Box */}
            <div className="w-2/3 flex flex-col p-4 space-y-4">
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-md shadow-inner">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${
                      msg.sender === user?.uid ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg text-sm max-w-xs ${
                        msg.sender === user?.uid
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300"
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1">
                        {msg.senderName || "User"} •{" "}
                        <span className="italic text-gray-500">{msg.senderRole || "User"}</span> •{" "}
                        {msg.timestamp?.seconds
                          ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString()
                          : "Just now"}
                      </p>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Chat;
