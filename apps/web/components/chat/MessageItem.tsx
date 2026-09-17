"use client";

import { useState } from "react";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "🚀", "👀", "✅", "🔥"];

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

interface Message {
  id: string;
  content: string;
  user: User;
  createdAt: string;
  isEdited: boolean;
  attachments: Attachment[];
  _count?: { replies: number };
}

interface GroupedReaction {
  emoji: string;
  count: number;
  mine: boolean;
}

interface Props {
  message: Message;
  currentUserId: string;
  isContinuation: boolean;
  groupedReactions: GroupedReaction[];
  onReact: (emoji: string) => void;
  onThread?: () => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MessageItem({
  message,
  currentUserId,
  isContinuation,
  groupedReactions,
  onReact,
  onThread,
}: Props) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isOwn = message.user.id === currentUserId;

  return (
    <div
      className={`group relative flex gap-3 px-2 py-1 rounded-xl hover:bg-white/[0.03] transition-glass ${
        isContinuation ? "mt-0.5" : "mt-3"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
    >
      {/* Avatar / spacer */}
      <div className="w-8 shrink-0 mt-0.5">
        {!isContinuation ? (
          message.user.image ? (
            <img
              src={message.user.image}
              alt={message.user.name || ""}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full vertex-gradient flex items-center justify-center text-xs font-bold">
              {message.user.name?.[0] || "?"}
            </div>
          )
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {!isContinuation && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-semibold text-sm hover:underline cursor-pointer">
              {message.user.name || "Unknown"}
            </span>
            {message.user.githubUsername && (
              <span className="text-xs text-muted">@{message.user.githubUsername}</span>
            )}
            <span className="text-xs text-muted">{formatTime(message.createdAt)}</span>
            {message.isEdited && <span className="text-xs text-muted">(edited)</span>}
          </div>
        )}

        {/* Message text */}
        <div className="message-content text-sm text-subtle leading-relaxed">
          {renderContent(message.content)}
        </div>

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <AttachmentPreview key={att.id} attachment={att} />
            ))}
          </div>
        )}

        {/* Reactions */}
        {groupedReactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {groupedReactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-glass
                  ${r.mine
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "glass border-white/10 text-subtle hover:border-white/20 hover:text-white"
                  }`}
              >
                <span>{r.emoji}</span>
                <span>{r.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread count */}
        {(message._count?.replies ?? 0) > 0 && onThread && (
          <button
            onClick={onThread}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {message._count!.replies} {message._count!.replies === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Action bar */}
      {showActions && (
        <div className="absolute right-2 top-0 -translate-y-1/2 flex items-center gap-0.5 glass rounded-xl px-1 py-0.5 shadow-xl border border-white/10 z-10">
          {/* Emoji picker */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker((p) => !p)}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.06] transition-glass text-sm"
              title="React"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute right-0 top-full mt-1 glass rounded-xl p-2 flex gap-1 z-20 shadow-xl border border-white/10">
                {QUICK_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { onReact(e); setShowEmojiPicker(false); }}
                    className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-sm transition-glass"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Thread */}
          {onThread && (
            <button
              onClick={onThread}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.06] transition-glass"
              title="Reply in thread"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}

          {/* Pin (own messages) */}
          {isOwn && (
            <button
              onClick={async () => {
                await fetch(`/api/messages/${message.id}/pin`, { method: "POST" });
              }}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.06] transition-glass text-xs"
              title="Pin"
            >
              📌
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function renderContent(content: string): React.ReactNode {
  // Basic markdown: **bold**, `code`, mentions @user, #channel
  const parts = content.split(/(`[^`]+`|\*\*[^*]+\*\*|@\w+|#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("@")) {
      return <span key={i} className="mention">{part}</span>;
    }
    if (part.startsWith("#")) {
      return <span key={i} className="text-indigo-400 cursor-pointer hover:underline">{part}</span>;
    }
    return part;
  });
}

function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.mimeType.startsWith("image/");
  if (isImage) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={attachment.url}
          alt={attachment.filename}
          className="max-w-xs max-h-48 rounded-xl object-cover border border-white/10"
        />
      </a>
    );
  }
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 glass px-3 py-2 rounded-xl text-sm hover:bg-white/[0.06] transition-glass"
    >
      <span className="text-muted">📄</span>
      <div>
        <p className="font-medium text-xs truncate max-w-[160px]">{attachment.filename}</p>
        <p className="text-muted text-xs">{formatSize(attachment.size)}</p>
      </div>
    </a>
  );
}
