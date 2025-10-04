import React, { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import ChatAssistantWrapper from "./ChatAssistantWrapper";

const FloatingChatAssistant = () => {
  const [open, setOpen] = useState(false);
  


  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="relative w-[350px] max-w-[90vw] bg-white shadow-xl rounded-xl transition-all duration-300">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-black"
          >
            <X size={20} />
          </button>
          <div className="p-3 pt-8">
            <ChatAssistantWrapper />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default FloatingChatAssistant;
