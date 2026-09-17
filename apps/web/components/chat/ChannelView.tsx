"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  githubUsername?: string | null;
}

interface Attachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

interface Reaction {
  id: string;
  emoji: string;
  user: { id: string; name: string | null };
}

interface Reply {
  id: string;
  user: User;
  content: string;
}

interface Message {
  id: string;
  content: string;
  user: User;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  reactions: Reaction[];
  attachments: Attachment[];
  replies: Reply[];
  _count?: { replies: number };
}

interface Pin {
  id: string;
  message: { id: string; content: string; user: User };
}

interface Channel {
  id: string;
  name: string;
  type: string;
  topic: string | null;
  description: string | null;
  githubRepoName: string | null;
  githubRepoOwner: string | null;
  ws: { id: string; name: string; slug: string };
}

interface Props {
  channel: Channel;
  initialMessages: Message[];
  pins: Pin[];
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string;
}

export function ChannelView({
  channel,
  initialMessages,
  pins,
  currentUserId,
  currentUserName,
  currentUserImage,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [showPins, setShowPins] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const poll = async () => {
      const last = messages[messages.length - 1];
      const since = last ? encodeURIComponent(last.createdAt) : "";
      try {
        const res = await fetch(
          `/api/channels/${channel.id}/messages?since=${since}&limit=20`
        );
        const data = await res.json();
        if (data.messages?.length) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const newOnes = data.messages.filter((m: Message) => !ids.has(m.id));
            return newOnes.length ? [...prev, ...newOnes] : prev;
          });
        }
      } catch { /* ignore */ }
    };

    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [channel.id, messages]);

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      // Optimistic update
      const temp: Message = {
        id: `temp-${Date.now()}`,
        content,
        user: {
          id: currentUserId,
          name: currentUserName,
          image: currentUserImage || null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false,
        reactions: [],
        attachments: [],
        replies: [],
        _count: { replies: 0 },
      };
      setMessages((prev) => [...prev, temp]);

      const formData = new FormData();
      formData.append("content", content);
      formData.append("channelId", channel.id);
      if (attachments) {
        attachments.forEach((f) => formData.append("files", f));
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === temp.id ? data.message : m))
        );
      }
    },
    [channel.id, currentUserId, currentUserName, currentUserImage]
  );

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    await fetch(`/api/messages/${messageId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find(
          (r) => r.emoji === emoji && r.user.id === currentUserId
        );
        if (existing) {
          return { ...m, reactions: m.reactions.filter((r) => r.id !== existing.id) };
        }
        return {
          ...m,
          reactions: [
            ...m.reactions,
            { id: `temp-${Date.now()}`, emoji, user: { id: currentUserId, name: currentUserName } },
          ],
        };
      })
    );
  }, [currentUserId, currentUserName]);

  const groupedReactions = (reactions: Reaction[]) => {
    const map: Record<string, { emoji: string; count: number; mine: boolean }> = {};
    for (const r of reactions) {
      if (!map[r.emoji]) map[r.emoji] = { emoji: r.emoji, count: 0, mine: false };
      map[r.emoji].count++;
      if (r.user.id === currentUserId) map[r.emoji].mine = true;
    }
    return Object.values(map);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Channel header */}
      <div className="h-14 px-5 glass-sidebar border-b border-white/[0.06] flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-muted font-semibold text-lg">
            {channel.type === "announcement" ? "📢" : channel.githubRepoName ? "⚙" : "#"}
          </span>
          <h1 className="font-semibold text-base truncate">{channel.name}</h1>
          {channel.topic && (
            <>
              <span className="text-white/10">|</span>
              <span className="text-muted text-sm truncate hidden sm:block">{channel.topic}</span>
            </>
          )}
          {channel.githubRepoName && (
            <a
              href={`https://github.com/${channel.githubRepoOwner}/${channel.githubRepoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              {channel.githubRepoOwner}/{channel.githubRepoName}
            </a>
          )}
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1 shrink-0">
          {pins.length > 0 && (
            <button
              onClick={() => setShowPins((p) => !p)}
              className={`p-2 rounded-lg text-sm transition-glass ${showPins ? "bg-indigo-500/20 text-indigo-300" : "text-muted hover:text-white hover:bg-white/[0.06]"}`}
              data-tooltip="Pinned messages"
            >
              📌 {pins.length}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-3xl mb-4">
                  {channel.type === "announcement" ? "📢" : "#"}
                </div>
                <h3 className="font-semibold text-lg mb-1">Welcome to #{channel.name}</h3>
                <p className="text-muted text-sm max-w-sm">
                  {channel.description || "This is the beginning of the channel. Say hi!"}
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const prevMsg = i > 0 ? messages[i - 1] : null;
                const isContinuation =
                  prevMsg &&
                  prevMsg.user.id === msg.user.id &&
                  new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000;
                return (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    currentUserId={currentUserId}
                    isContinuation={!!isContinuation}
                    groupedReactions={groupedReactions(msg.reactions)}
                    onReact={(emoji) => addReaction(msg.id, emoji)}
                    onThread={() => setThreadMessage(msg)}
                  />
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <MessageInput
            channelName={channel.name}
            onSend={sendMessage}
          />
        </div>

        {/* Pins panel */}
        {showPins && (
          <div className="w-72 glass-sidebar border-l border-white/[0.06] flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h3 className="font-semibold text-sm">Pinned Messages</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {pins.map((pin) => (
                <div key={pin.id} className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {pin.message.user.image && (
                      <img src={pin.message.user.image} alt="" className="w-5 h-5 rounded-full" />
                    )}
                    <span className="text-xs font-medium">{pin.message.user.name}</span>
                  </div>
                  <p className="text-xs text-subtle line-clamp-3">{pin.message.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thread panel */}
        {threadMessage && (
          <div className="w-80 glass-sidebar border-l border-white/[0.06] flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="font-semibold text-sm">Thread</h3>
              <button
                onClick={() => setThreadMessage(null)}
                className="p-1 rounded text-muted hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <MessageItem
                message={threadMessage}
                currentUserId={currentUserId}
                isContinuation={false}
                groupedReactions={groupedReactions(threadMessage.reactions)}
                onReact={(emoji) => addReaction(threadMessage.id, emoji)}
              />
              {threadMessage.replies.map((reply) => (
                <div key={reply.id} className="flex gap-2 mt-3 pl-4 border-l border-white/[0.06]">
                  {reply.user.image && (
                    <img src={reply.user.image} alt="" className="w-6 h-6 rounded-full shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-xs font-semibold">{reply.user.name}</span>
                    <p className="text-sm text-subtle mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <MessageInput
              channelName="reply"
              onSend={async (content) => {
                await fetch("/api/messages", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    channelId: channel.id,
                    parentId: threadMessage.id,
                    content,
                  }),
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
