import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaUserFriends,
  FaComments,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../components/firebase";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const authInstance = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (u) => {
      if (u) {
        setUser(u);
        const userRef = doc(db, "Users", u.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } else {
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, []);

  // Base navigation items
  const baseNavItems = [
    { name: "Home", path: "/dashboard", icon: <FaHome /> },
    { name: "Post", path: "/post", icon: <FaUserFriends /> },
    { name: "Meetings", path: "/meetings", icon: <FaCalendarAlt /> },
    { name: "Chat", path: "/chat", icon: <FaComments /> },
    { name: "Profile", path: "/profile", icon: <FaUserFriends /> },
   
  ];

  // Conditionally include Earnings for Mentor only
  const navItems =
    userData?.role === "Mentor"
      ? [
          ...baseNavItems,
          {
            name: "Earnings",
            path: "/earnings",
            icon: <span className="text-green-500 font-bold">₹</span>,
          },
        ]
      : baseNavItems;

  const handleLogout = async () => {
    try {
      await signOut(authInstance);
      toast.info("Logged out successfully!");
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed!");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/5 bg-white p-5 shadow-lg flex flex-col items-start space-y-6">
        <h2 className="text-xl font-bold text-gray-700 flex items-center space-x-2">
          <span className="text-blue-500 text-xl font-bold">{`</>`}</span>
          <span>{userData?.role || "User"}</span>
        </h2>

        <nav className="w-full space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition duration-300 ${
                location.pathname === item.path
                  ? "bg-blue-500 text-white font-bold shadow-lg"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 text-red-500 px-4 py-2 rounded-lg bg-gray-200 hover:bg-indigo-500 hover:text-white shadow-md"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {userData?.firstName || "User"}!
        </h1>
        {/* You can put your dashboard cards or charts here */}
        <div className="text-lg text-gray-600">
          📊 This is your personalized dashboard.
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
