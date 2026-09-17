"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  status: string;
  color: string;
  order: number;
}

interface Roadmap {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  milestones: Milestone[];
}

const STATUS_CONFIG = {
  planned: { label: "Planned", color: "#6366f1" },
  "in-progress": { label: "In Progress", color: "#f59e0b" },
  completed: { label: "Completed", color: "#22c55e" },
  delayed: { label: "Delayed", color: "#ef4444" },
};

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#22c55e", "#06b6d4"];

function positionBar(ms: Milestone, rangeStart: Date, totalDays: number) {
  const start = ms.startDate ? new Date(ms.startDate) : new Date(ms.dueDate || Date.now());
  const end = ms.dueDate ? new Date(ms.dueDate) : start;
  const left = Math.max(0, ((start.getTime() - rangeStart.getTime()) / (totalDays * 86400000)) * 100);
  const width = Math.max(2, ((end.getTime() - start.getTime()) / (totalDays * 86400000)) * 100);
  return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
}

export default function RoadmapPage() {
  const params = useParams();
  const slug = params.workspaceId as string;

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  useEffect(() => {
    fetch(`/api/roadmap?workspaceSlug=${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.roadmaps) setRoadmaps(d.roadmaps); })
      .finally(() => setLoading(false));
  }, [slug]);

  const addMilestone = async () => {
    if (!newTitle.trim() || !roadmaps[activeIdx]) return;
    const res = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-milestone",
        roadmapId: roadmaps[activeIdx].id,
        title: newTitle,
        startDate: newStart || undefined,
        dueDate: newEnd || undefined,
        color: COLORS[roadmaps[activeIdx].milestones.length % COLORS.length],
      }),
    });
    const data = await res.json();
    if (data.milestone) {
      setRoadmaps((rs) =>
        rs.map((r, i) =>
          i === activeIdx ? { ...r, milestones: [...r.milestones, data.milestone] } : r
        )
      );
    }
    setNewTitle(""); setNewStart(""); setNewEnd(""); setShowAdd(false);
  };

  if (loading) return <div className="flex items-center justify-center h-full text-muted text-sm animate-pulse">Loading roadmap…</div>;

  const roadmap = roadmaps[activeIdx];
  if (!roadmap) return <div className="flex items-center justify-center h-full text-muted">No roadmap found.</div>;

  // Calculate timeline range
  const allDates = roadmap.milestones.flatMap((m) =>
    [m.startDate, m.dueDate].filter(Boolean).map((d) => new Date(d!).getTime())
  );
  const rangeStart = allDates.length > 0 ? new Date(Math.min(...allDates)) : new Date();
  const rangeEnd = allDates.length > 0 ? new Date(Math.max(...allDates)) : new Date(Date.now() + 90 * 86400000);
  rangeStart.setDate(rangeStart.getDate() - 7);
  rangeEnd.setDate(rangeEnd.getDate() + 14);
  const totalDays = Math.max(30, (rangeEnd.getTime() - rangeStart.getTime()) / 86400000);

  // Month markers
  const months: { label: string; left: string }[] = [];
  const cur = new Date(rangeStart);
  cur.setDate(1);
  while (cur < rangeEnd) {
    const left = ((cur.getTime() - rangeStart.getTime()) / (totalDays * 86400000)) * 100;
    if (left >= 0 && left <= 100) {
      months.push({ label: cur.toLocaleDateString(undefined, { month: "short", year: "2-digit" }), left: `${left}%` });
    }
    cur.setMonth(cur.getMonth() + 1);
  }

  const today = ((Date.now() - rangeStart.getTime()) / (totalDays * 86400000)) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 glass-sidebar border-b border-white/[0.06] flex items-center gap-4 shrink-0">
        <h1 className="font-bold text-lg">Roadmap</h1>
        <div className="flex gap-1">
          {roadmaps.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-glass ${i === activeIdx ? "bg-indigo-500/20 text-indigo-300" : "text-muted hover:text-white glass"}`}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setShowAdd(true)}
          className="glass-btn px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add milestone
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">
        <div className="min-w-[700px]">
          {/* Month ruler */}
          <div className="relative h-8 mb-2">
            {months.map((m) => (
              <span
                key={m.label + m.left}
                className="absolute text-xs text-muted"
                style={{ left: m.left }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="relative">
            <div className="absolute inset-0 pointer-events-none">
              {months.map((m) => (
                <div
                  key={m.left}
                  className="absolute top-0 bottom-0 w-px bg-white/[0.05]"
                  style={{ left: m.left }}
                />
              ))}
              {/* Today line */}
              {today >= 0 && today <= 100 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-indigo-500/60"
                  style={{ left: `${today}%` }}
                >
                  <span className="absolute -top-5 -translate-x-1/2 text-[10px] text-indigo-400 whitespace-nowrap">Today</span>
                </div>
              )}
            </div>

            {/* Milestones */}
            <div className="space-y-3">
              {roadmap.milestones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-5xl mb-4">🗺</div>
                  <h3 className="font-semibold mb-1">No milestones yet</h3>
                  <p className="text-muted text-sm">Add your first milestone to start planning</p>
                </div>
              ) : (
                roadmap.milestones.map((ms) => {
                  const pos = positionBar(ms, rangeStart, totalDays);
                  const cfg = STATUS_CONFIG[ms.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.planned;
                  return (
                    <div key={ms.id} className="relative h-14 glass rounded-xl">
                      {/* Label on left */}
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <p className="text-xs font-medium truncate max-w-[180px]">{ms.title}</p>
                        <p className="text-[10px] text-muted">{cfg.label}</p>
                      </div>
                      {/* Bar */}
                      <div
                        className="absolute top-3 bottom-3 rounded-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ left: pos.left, width: pos.width, background: ms.color || cfg.color, minWidth: 8 }}
                        title={`${ms.title}: ${ms.startDate ? new Date(ms.startDate).toLocaleDateString() : "?"} → ${ms.dueDate ? new Date(ms.dueDate).toLocaleDateString() : "?"}`}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 text-xs text-muted">
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: v.color }} />
                {v.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Add milestone modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative glass-heavy rounded-2xl p-6 w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-4">Add Milestone</h2>
            <div className="space-y-3">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMilestone()}
                placeholder="Milestone title"
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">Start date</label>
                  <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Due date</label>
                  <input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={addMilestone} className="flex-1 glass-btn-primary py-2 rounded-xl text-sm font-medium">Add milestone</button>
                <button onClick={() => setShowAdd(false)} className="glass py-2 px-4 rounded-xl text-sm text-muted hover:text-white">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
