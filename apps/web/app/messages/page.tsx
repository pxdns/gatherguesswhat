"use client";

import { useState, useRef, useEffect } from "react";

interface Attachment {
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  avatar: string;
  attachment?: Attachment;
  filtered?: boolean;
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
];

function isImage(type: string) {
  return type.startsWith("image/");
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setPendingAttachment(data);
    } catch {
      setError("Upload failed — check your connection");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSend() {
    if (!input.trim() && !pendingAttachment) return;
    setError(null);
    setSending(true);

    try {
      let finalContent = input;
      let wasFiltered = false;

      if (input.trim()) {
        const res = await fetch("/api/moderation/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: input }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Message blocked by content filter");
          setSending(false);
          return;
        }
        finalContent = data.content;
        wasFiltered = data.matched?.length > 0;
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        author: "You",
        content: finalContent,
        timestamp: new Date(),
        avatar: "🧑",
        attachment: pendingAttachment || undefined,
        filtered: wasFiltered,
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
      setPendingAttachment(null);
    } finally {
      setSending(false);
    }
  }

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
                {msg.filtered && (
                  <span className="text-xs text-amber-600 dark:text-amber-500">
                    ⚠ filtered
                  </span>
                )}
              </div>
              {msg.content && (
                <p className="text-slate-700 dark:text-slate-300">{msg.content}</p>
              )}
              {msg.attachment && (
                <div className="mt-2">
                  {isImage(msg.attachment.type) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={msg.attachment.url}
                      alt={msg.attachment.filename}
                      className="max-w-xs max-h-64 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <a
                      href={msg.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      <span>📎</span>
                      <span className="text-sm font-medium">
                        {msg.attachment.filename}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatSize(msg.attachment.size)}
                      </span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm border-t border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {/* Pending attachment preview */}
      {pendingAttachment && (
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm">
            <span>📎</span>
            <span className="font-medium">{pendingAttachment.filename}</span>
            <span className="text-slate-500">{formatSize(pendingAttachment.size)}</span>
          </div>
          <button
            onClick={() => setPendingAttachment(null)}
            className="text-slate-500 hover:text-red-600 text-sm"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain,application/zip"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Attach a file"
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {uploading ? "..." : "📎"}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
            placeholder="Message #general..."
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
          />
          <button
            onClick={handleSend}
            disabled={sending || (!input.trim() && !pendingAttachment)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
