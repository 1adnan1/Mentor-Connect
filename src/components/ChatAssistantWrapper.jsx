import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import ChatAssistant from "./ChatAssistant";

const ChatAssistantWrapper = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: [data.firstName, data.lastName].filter(Boolean).join(" ") || "User",
            role: data.role || "Mentee",
          });
        }
      }
    });
  
    return () => unsubscribe();
  }, []);

  if (!userData) return <p className="text-center mt-4">Loading assistant...</p>;

  return <ChatAssistant user={userData.name} role={userData.role} />;
};

export default ChatAssistantWrapper;
