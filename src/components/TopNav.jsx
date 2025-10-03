import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { FaBell } from "react-icons/fa";

const TopNav = () => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // 🔐 Load user and fetch notifications
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid); // ✅ Track user ID for readBy logic

        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    });

    const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
    const unsubscribeNoti = onSnapshot(q, (snapshot) => {
      const notis = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notis);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNoti();
    };
  }, []);

  // 🔔 Mark current user's unread notifications as read
  const handleDropdownToggle = async () => {
    setShowDropdown(!showDropdown);
    if (!currentUserId) return;

    const unread = notifications.filter((n) => !(n.readBy || []).includes(currentUserId));
    for (let noti of unread) {
      const ref = doc(db, "notifications", noti.id);
      const updatedReadBy = [...(noti.readBy || []), currentUserId];
      await updateDoc(ref, { readBy: updatedReadBy });
    }
  };

  const getRoleTitle = () => {
    if (!userData) return "Loading...";
    if (userData.role === "Mentee") return "Mentee";
    if (userData.role === "Admin") return "Admin";
    return "Mentor";
  };

  const unreadCount = notifications.filter(
    (n) => !(n.readBy || []).includes(currentUserId)
  ).length;

  return (
    <div className="flex w-screen items-center justify-between px-4 py-3 bg-white shadow-md border-b-2 relative z-50">
      {/* Logo */}
      <h2 className="text-xl font-bold text-gray-700 flex items-center space-x-2">
        <span className="text-blue-500 text-xl font-bold">{`</>`}</span>
        <span>{getRoleTitle()}</span>
      </h2>

      {/* Right Section */}
      <div className="flex items-center space-x-6 relative">
        {/* Notification Icon */}
        <div className="relative">
          <FaBell
            className="text-gray-600 text-xl cursor-pointer"
            onClick={handleDropdownToggle}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-md max-h-80 overflow-y-auto">
              <div className="p-3 font-bold border-b text-gray-700">Notifications</div>
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((noti, index) => {
                  const isRead = noti.readBy?.includes(currentUserId);
                  return (
                    <div
                      key={index}
                      className={`px-4 py-2 text-sm border-b hover:bg-gray-100 ${
                        isRead ? "text-gray-500" : "text-gray-800 font-semibold"
                      }`}
                    >
                      {noti.message}
                      <div className="text-xs text-gray-400">
                        {noti.timestamp?.seconds
                          ? new Date(noti.timestamp.seconds * 1000).toLocaleString()
                          : "Just now"}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No notifications</div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {userData
              ? userData.firstName.charAt(0).toUpperCase() +
                userData.lastName.charAt(0).toUpperCase()
              : "U"}
          </div>
          <div>
            <p className="text-gray-800 font-semibold">
              {userData ? `${userData.firstName} ${userData.lastName}` : "Loading..."}
            </p>
            <p className="text-sm text-gray-500">{userData ? userData.email : ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
