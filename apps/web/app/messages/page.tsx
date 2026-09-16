"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  avatar: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    author: "John",
    content: "Hey everyone! How's it going?",
    timestamp: new Date(Date.now() - 3600000),
    avatar: "👨",
  },
  {
    id: "2",
    author: "Sarah",
    content: "Great! Working on some cool projects",
    timestamp: new Date(Date.now() - 1800000),
    avatar: "👩",
  },
  {
    id: "3",
    author: "Mike",
    content: "Anyone want to grab coffee later?",
    timestamp: new Date(Date.now() - 600000),
    avatar: "👨‍🦱",
  },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        author: "You",
        content: input,
        timestamp: new Date(),
        avatar: "🧑",
      };
      setMessages([...messages, newMessage]);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 p-4">
        <h1 className="text-2xl font-bold">#general</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Developers Community
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <span className="text-2xl">{msg.avatar}</span>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{msg.author}</span>
                <span className="text-xs text-slate-500">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message #general..."
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
