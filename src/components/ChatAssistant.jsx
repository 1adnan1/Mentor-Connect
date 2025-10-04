import React, { useState, useEffect, useRef } from "react";

const ChatAssistant = ({ user = "User", role = "Mentee" }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [shortMode, setShortMode] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load previous chat or greet
  useEffect(() => {
    const saved = localStorage.getItem("chat-assistant-messages");
  
    if (saved && JSON.parse(saved).length > 0) {
      setMessages(JSON.parse(saved));
    } else {
      const greeting = {
        sender: "bot",
        text: `Hi ${user} (${role})! How can I assist you today?`,
      };
      setMessages([greeting]);
      localStorage.setItem("chat-assistant-messages", JSON.stringify([greeting]));
    }
  }, [user, role]);
  

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("chat-assistant-messages", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const systemPrompt = shortMode
        ? "Respond briefly and concisely."
        : "Respond in a detailed and helpful way.";

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input },
          ],
        }),
      });

      const data = await res.json();
      const botResponse = data.choices?.[0]?.message?.content || "Sorry, try again!";

      let index = 0;
      let currentText = "";

      setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

      const interval = setInterval(() => {
        currentText += botResponse.charAt(index);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = currentText;
          return updated;
        });
        index++;
        if (index >= botResponse.length) clearInterval(interval);
      }, 20);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error contacting assistant!" },
      ]);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-800">✨ Short Answer Mode</span>
        <input
          type="checkbox"
          checked={shortMode}
          onChange={() => setShortMode((prev) => !prev)}
          className="accent-blue-600"
        />
      </div>

      <div className="h-64 overflow-y-auto mb-3 border rounded p-2 bg-gray-50 text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${
              msg.sender === "bot" ? "text-blue-600" : "text-gray-800"
            }`}
          >
            <strong>{msg.sender === "bot" ? "Assistant" : user}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask something..."
          className="flex-grow border px-4 py-2 rounded focus:outline-none"
        />
       <button
  onClick={handleSend}
  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
  disabled={!input.trim()}
>
  Send
</button>

      </div>
    

    </div>
  );
};

export default ChatAssistant;
