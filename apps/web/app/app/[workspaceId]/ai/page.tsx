"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

const SUGGESTIONS = [
  "Review this code for bugs and improvements",
  "Help me write acceptance criteria for a new feature",
  "Summarize what our team should focus on this sprint",
  "Explain the architecture of our codebase",
  "Draft a technical spec for a new API endpoint",
  "Help me write a PR description",
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
          isUser ? "vertex-gradient" : "bg-indigo-500/20 border border-indigo-500/30"
        }`}
      >
        {isUser ? "Y" : "✦"}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "glass-btn text-white rounded-tr-sm"
            : "glass text-subtle rounded-tl-sm"
        }`}
      >
        {renderMarkdown(msg.content)}
        {msg.streaming && (
          <span className="inline-block w-1 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}

function renderMarkdown(text: string): React.ReactNode {
  // Split on code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.split("\n");
      const lang = lines[0].replace("```", "").trim();
      const code = lines.slice(1, -1).join("\n");
      return (
        <pre key={i} className="my-2 p-3 rounded-xl bg-black/40 border border-white/10 overflow-x-auto text-xs font-mono">
          {lang && <div className="text-indigo-400 text-[10px] mb-2 uppercase tracking-wide">{lang}</div>}
          <code>{code}</code>
        </pre>
      );
    }
    // Inline formatting
    return (
      <span key={i}>
        {part.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).map((seg, j) => {
          if (seg.startsWith("`") && seg.endsWith("`")) {
            return (
              <code key={j} className="px-1 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-xs font-mono">
                {seg.slice(1, -1)}
              </code>
            );
          }
          if (seg.startsWith("**") && seg.endsWith("**")) {
            return <strong key={j}>{seg.slice(2, -2)}</strong>;
          }
          if (seg.startsWith("*") && seg.endsWith("*")) {
            return <em key={j}>{seg.slice(1, -1)}</em>;
          }
          return seg.split("\n").map((line, k) => (
            <span key={k}>
              {line}
              {k < seg.split("\n").length - 1 && <br />}
            </span>
          ));
        })}
      </span>
    );
  });
}

export default function AIPage() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/ai")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    const userMsg: Message = { role: "user", content: text };
    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId,
          workspaceContext: params.workspaceId,
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.text) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.role !== "assistant") return prev;
              return [...prev.slice(0, -1), { ...last, content: last.content + data.text }];
            });
          }
          if (data.done) {
            setConversationId(data.conversationId);
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              return [...prev.slice(0, -1), { ...last, streaming: false }];
            });
            // Refresh conversation list
            fetch("/api/ai")
              .then((r) => r.json())
              .then((d) => setConversations(d.conversations || []));
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          { ...last, content: "Sorry, something went wrong. Please try again.", streaming: false },
        ];
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const newConversation = () => {
    setConversationId(undefined);
    setMessages([]);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Conversation sidebar */}
      {sidebarOpen && (
        <div className="w-64 glass-sidebar border-r border-white/[0.06] flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <span className="text-indigo-400">✦</span>
              AI Assistant
            </h2>
            <button
              onClick={newConversation}
              className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/[0.06] transition-glass"
              title="New conversation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted text-center py-8">No conversations yet</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setConversationId(c.id);
                    setMessages([]);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/[0.04] transition-glass ${
                    c.id === conversationId ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""
                  }`}
                >
                  <p className="truncate text-subtle hover:text-white">{c.title || "New conversation"}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="px-3 py-2 border-t border-white/[0.06]">
            <div className="glass rounded-xl px-3 py-2 text-xs text-muted">
              <p className="font-semibold mb-0.5 text-indigo-400">Powered by Claude Opus 5</p>
              <p>Anthropic — claude-opus-5</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 px-4 glass-sidebar border-b border-white/[0.06] flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.06] transition-glass"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="text-sm font-semibold">
            {conversationId ? "Conversation" : "New conversation"}
          </span>
          <div className="flex-1" />
          {conversationId && (
            <button onClick={newConversation} className="glass-btn px-3 py-1 rounded-lg text-xs font-medium">
              New
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-3xl mb-6">
                ✦
              </div>
              <h2 className="text-xl font-bold mb-2">Vertex AI</h2>
              <p className="text-muted text-sm max-w-sm mb-8">
                Your AI collaborator. Ask me about code, planning, documentation — anything your team needs.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-left p-3 rounded-xl glass hover:bg-white/[0.07] transition-glass text-sm text-subtle hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 pb-6 shrink-0 max-w-2xl mx-auto w-full">
          <div className="flex gap-3 glass rounded-2xl p-3 border border-white/[0.08] focus-within:border-indigo-500/40 transition-glass">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Ask Vertex AI anything…"
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 resize-none outline-none leading-relaxed"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="self-end p-2 rounded-xl glass-btn-primary disabled:opacity-40 disabled:cursor-not-allowed transition-glass"
            >
              {loading ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-muted mt-2">
            Claude Opus 5 · Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
