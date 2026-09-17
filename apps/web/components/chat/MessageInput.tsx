"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface Props {
  channelName: string;
  onSend: (content: string, attachments?: File[]) => Promise<void>;
}

export function MessageInput({ channelName, onSend }: Props) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    const content = value.trim();
    if ((!content && files.length === 0) || sending) return;
    setSending(true);
    try {
      await onSend(content, files.length > 0 ? files : undefined);
      setValue("");
      setFiles([]);
    } finally {
      setSending(false);
      textRef.current?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="px-4 pb-4 shrink-0">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((f, i) => (
            <div key={i} className="glass flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-muted">📎</span>
              <span className="truncate max-w-[100px]">{f.name}</span>
              <button
                onClick={() => removeFile(i)}
                className="text-muted hover:text-red-400 transition-colors ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 glass rounded-2xl px-3 py-2 border border-white/[0.08] focus-within:border-indigo-500/40 transition-glass">
        {/* Attach */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="p-1.5 rounded-lg text-muted hover:text-white transition-colors shrink-0 mb-0.5"
          title="Attach file"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,application/pdf,text/plain,application/zip"
          className="hidden"
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            setFiles((prev) => [...prev, ...selected].slice(0, 5));
            e.target.value = "";
          }}
        />

        {/* Text area */}
        <textarea
          ref={textRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
          }}
          onKeyDown={onKeyDown}
          placeholder={`Message #${channelName}`}
          rows={1}
          className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 resize-none outline-none py-1 leading-relaxed"
          style={{ maxHeight: 160 }}
          disabled={sending}
        />

        {/* Send */}
        <button
          type="button"
          onClick={submit}
          disabled={(!value.trim() && files.length === 0) || sending}
          className="p-1.5 rounded-xl glass-btn-primary disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-0.5 transition-glass"
          title="Send (Enter)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
