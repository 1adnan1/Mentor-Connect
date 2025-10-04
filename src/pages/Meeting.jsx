import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import LeftBar from "../components/LeftBar";
import { CalendarIcon } from "lucide-react";
import { db, auth } from "../components/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function MeetingsPage() {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [datetime, setDatetime] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(""); // 👈 track role

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userSnap = await getDoc(doc(db, "Users", u.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setRole(data.role || "Mentee");
        }
      } else navigate("/signin");
    });

    const q = query(collection(db, "meetings"), orderBy("createdAt", "desc"));
    const unsubMeetings = onSnapshot(q, (snap) => {
      const results = [];
      snap.forEach((doc) => results.push({ id: doc.id, ...doc.data() }));
      setMeetings(results);
    });

    return () => {
      unsub();
      unsubMeetings();
    };
  }, []);

  const handleSchedule = async () => {
    if (!description || !link || !datetime || !user) return;
  
    try {
      await addDoc(collection(db, "meetings"), {
        description,
        link,
        datetime,
        createdAt: serverTimestamp(),
        createdBy: user.displayName || user.email,
      });
  
      
      await addDoc(collection(db, "notifications"), {
        message: `📅 New meeting scheduled by ${user.displayName || user.email}`,
        timestamp: serverTimestamp(),
        readBy: [],
      });
  
      setDescription("");
      setLink("");
      setDatetime("");
    } catch (err) {
      console.error("Meeting creation failed:", err);
    }
  };
  

  return (
    <>
      <TopNav />
      <div className="flex bg-gray-100 min-h-[100vh]">
        {/* Sidebar */}
        <div className="w-1/5 bg-white shadow-md flex flex-col h-[100vh]">
          <LeftBar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Meetings List */}
          <div className={`${role === "Mentee" ? "w-full" : "w-[60%]"} p-6 overflow-y-auto`}>
            <h2 className="text-lg font-semibold mb-4">All meetings</h2>
            {meetings.map((m) => (
              <div key={m.id} className="bg-white rounded shadow p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                      {m.createdBy?.[0]?.toUpperCase() || "M"}
                    </div>
                    <div>
                      <p className="font-semibold">{m.createdBy || "Anonymous"}</p>
                      <p className="text-sm text-gray-500">
                        {m.createdAt?.seconds
                          ? new Date(m.createdAt.seconds * 1000).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-3">{m.description}</p>
                <a
                  href={m.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm"
                >
                  {m.link}
                </a>
                <div className="mt-2">
                  <span className="text-xs text-blue-600 bg-blue-100 rounded-full px-3 py-1">
                    CSM20040
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Meeting on: {new Date(m.datetime).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Schedule Meeting - Only for Mentor/Admin */}
          {(role === "Mentor" || role === "Admin") && (
            <div className="w-[40%] p-6 border-l bg-white h-full">
              <h2 className="text-lg font-semibold mb-4">Schedule a meeting</h2>
              <textarea
                placeholder="Meeting description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="url"
                placeholder="Meeting link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-3 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-full">
                  <input
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <button
                onClick={handleSchedule}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md"
              >
                Schedule
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
