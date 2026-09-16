"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Community {
  id: string;
  name: string;
  icon: string | null;
  isMember: boolean;
}

interface Channel {
  id: string;
  name: string;
  communityId: string;
}

interface Attachment {
  id?: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  attachments: Attachment[];
}

function isImage(type: string) {
  return type.startsWith("image/");
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ChatView() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialCommunityId = searchParams.get("communityId");

  const [communities, setCommunities] = useState<Community[] | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    initialCommunityId
  );
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  // Load communities the user belongs to.
  useEffect(() => {
    fetch("/api/communities")
      .then((r) => r.json())
      .then((all: Community[]) => {
        const mine = all.filter((c) => c.isMember);
        setCommunities(mine);
        if (!selectedCommunityId && mine.length > 0) {
          setSelectedCommunityId(mine[0].id);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load channels for the selected community.
  useEffect(() => {
    if (!selectedCommunityId) return;
    fetch(`/api/communities/${selectedCommunityId}/channels`)
      .then((r) => r.json())
      .then((chans: Channel[]) => {
        setChannels(chans);
        setSelectedChannelId(chans[0]?.id || null);
      });
  }, [selectedCommunityId]);

  const loadMessages = useCallback(() => {
    if (!selectedChannelId) return;
    fetch(`/api/messages?channelId=${selectedChannelId}`)
      .then((r) => r.json())
      .then(setMessages);
  }, [selectedChannelId]);

  useEffect(loadMessages, [loadMessages]);

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
    if ((!input.trim() && !pendingAttachment) || !selectedChannelId) return;
    setError(null);
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannelId,
          content: input,
          attachment: pendingAttachment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send message");
        return;
      }
      setMessages((prev) => [...prev, data]);
      setInput("");
      setPendingAttachment(null);
    } finally {
      setSending(false);
    }
  }

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);
  const selectedCommunity = communities?.find((c) => c.id === selectedCommunityId);

  if (communities === null) {
    return <div className="p-8 text-slate-500">Loading...</div>;
  }

  if (communities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div>
          <p className="text-xl font-semibold mb-2">No communities yet</p>
          <p className="text-slate-500 mb-4">
            Join or create a community to start messaging.
          </p>
          <a
            href="/communities"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Browse Communities
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Community + channel picker */}
      <div className="w-56 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <select
            value={selectedCommunityId || ""}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-700 rounded dark:bg-slate-800 text-sm"
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon || "🌐"} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannelId(channel.id)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                channel.id === selectedChannelId
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              # {channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4">
          <h1 className="text-2xl font-bold">#{selectedChannel?.name || "..."}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {selectedCommunity?.name}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {msg.user.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">
                    {msg.user.id === session?.user?.id ? "You" : msg.user.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {msg.content && (
                  <p className="text-slate-700 dark:text-slate-300">{msg.content}</p>
                )}
                {msg.attachments.map((att, i) => (
                  <div key={att.id || i} className="mt-2">
                    {isImage(att.type) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={att.url}
                        alt={att.filename}
                        className="max-w-xs max-h-64 rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                        <span>📎</span>
                        <span className="text-sm font-medium">{att.filename}</span>
                        <span className="text-xs text-slate-500">
                          {formatSize(att.size)}
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm border-t border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

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
              disabled={uploading || !selectedChannelId}
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
              placeholder={
                selectedChannel ? `Message #${selectedChannel.name}...` : "Select a channel"
              }
              disabled={!selectedChannelId}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || !selectedChannelId || (!input.trim() && !pendingAttachment)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
      <ChatView />
    </Suspense>
  );
}
