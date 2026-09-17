"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

const PRIORITY_COLORS = {
  low: { dot: "#6b7280", label: "Low" },
  medium: { dot: "#eab308", label: "Medium" },
  high: { dot: "#f97316", label: "High" },
  urgent: { dot: "#ef4444", label: "Urgent" },
};

interface User { id: string; name: string | null; image: string | null; }
interface Task {
  id: string; title: string; description: string | null;
  priority: string; columnId: string; order: number;
  assignee: User | null; creator: User;
  dueDate: string | null; completedAt: string | null;
  labels: string[]; _count: { comments: number };
}
interface Column { id: string; name: string; color: string; order: number; tasks: Task[]; }
interface Board { id: string; name: string; columns: Column[]; }

function PriorityDot({ priority }: { priority: string }) {
  const cfg = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  return <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.dot }} title={cfg.label} />;
}

export default function TasksPage() {
  const params = useParams();
  const slug = params.workspaceId as string;

  const [boards, setBoards] = useState<Board[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBoard, setActiveBoard] = useState(0);
  const [dragging, setDragging] = useState<{ taskId: string; fromColumnId: string } | null>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetch(`/api/workspaces/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.workspace) return;
        setWorkspaceId(d.workspace.id);
        return fetch(`/api/tasks?workspaceId=${d.workspace.id}`);
      })
      .then((r) => r?.json())
      .then((d) => { if (d?.boards) setBoards(d.boards); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [slug]);

  const createTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-task", columnId, title: newTaskTitle.trim() }),
    });
    const data = await res.json();
    if (data.task) {
      setBoards((bs) =>
        bs.map((b) => ({
          ...b,
          columns: b.columns.map((c) =>
            c.id === columnId ? { ...c, tasks: [...c.tasks, data.task] } : c
          ),
        }))
      );
    }
    setNewTaskTitle("");
    setNewTaskColumn(null);
  };

  const moveTask = async (taskId: string, toColumnId: string, toOrder: number) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move-task", taskId, columnId: toColumnId, order: toOrder }),
    });
    setBoards((bs) =>
      bs.map((b) => {
        let task: Task | undefined;
        const cols = b.columns.map((c) => {
          const idx = c.tasks.findIndex((t) => t.id === taskId);
          if (idx !== -1) { task = c.tasks[idx]; return { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }; }
          return c;
        });
        if (!task) return b;
        task = { ...task, columnId: toColumnId, order: toOrder };
        return {
          ...b,
          columns: cols.map((c) =>
            c.id === toColumnId ? { ...c, tasks: [...c.tasks, task!].sort((a, b) => a.order - b.order) } : c
          ),
        };
      })
    );
  };

  const deleteTask = async (taskId: string, columnId: string) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-task", taskId }),
    });
    setBoards((bs) =>
      bs.map((b) => ({
        ...b,
        columns: b.columns.map((c) =>
          c.id === columnId ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) } : c
        ),
      }))
    );
    setSelectedTask(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted text-sm animate-pulse">Loading tasks…</div>;
  }

  const board = boards[activeBoard];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 glass-sidebar border-b border-white/[0.06] flex items-center gap-4 shrink-0">
        <h1 className="font-bold text-lg">Tasks</h1>
        <div className="flex gap-1">
          {boards.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setActiveBoard(i)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-glass ${i === activeBoard ? "bg-indigo-500/20 text-indigo-300" : "text-muted hover:text-white glass"}`}
            >
              {b.name}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="text-sm text-muted">
          {board?.columns.reduce((s, c) => s + c.tasks.length, 0) || 0} tasks
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-5 h-full min-w-max">
          {board?.columns.map((col) => (
            <div
              key={col.id}
              className="kanban-column flex flex-col glass rounded-2xl overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!dragging) return;
                const lastOrder = col.tasks.length > 0 ? col.tasks[col.tasks.length - 1].order + 1 : 0;
                moveTask(dragging.taskId, col.id, lastOrder);
                setDragging(null);
              }}
            >
              {/* Column header */}
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: col.color }} />
                <span className="font-semibold text-sm flex-1">{col.name}</span>
                <span className="text-xs text-muted glass px-2 py-0.5 rounded-full">{col.tasks.length}</span>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {col.tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDragging({ taskId: task.id, fromColumnId: col.id })}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => setSelectedTask(task)}
                    className={`glass rounded-xl p-3 cursor-grab active:cursor-grabbing hover:bg-white/[0.07] transition-glass select-none ${dragging?.taskId === task.id ? "dragging" : ""}`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <PriorityDot priority={task.priority} />
                      <p className="text-sm font-medium leading-snug flex-1">{task.title}</p>
                    </div>
                    {task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.labels.map((l) => (
                          <span key={l} className="text-[10px] px-1.5 py-0.5 rounded-full glass text-muted">{l}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-muted">
                        {task.dueDate && (
                          <span className={new Date(task.dueDate) < new Date() ? "text-red-400" : ""}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task._count.comments > 0 && (
                          <span>💬 {task._count.comments}</span>
                        )}
                      </div>
                      {task.assignee?.image && (
                        <img src={task.assignee.image} alt="" className="w-5 h-5 rounded-full" title={task.assignee.name || ""} />
                      )}
                    </div>
                  </div>
                ))}

                {/* Add task */}
                {newTaskColumn === col.id ? (
                  <div className="glass rounded-xl p-2">
                    <input
                      autoFocus
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") createTask(col.id);
                        if (e.key === "Escape") { setNewTaskColumn(null); setNewTaskTitle(""); }
                      }}
                      placeholder="Task title…"
                      className="w-full glass-input px-2 py-1.5 rounded-lg text-sm mb-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => createTask(col.id)} className="flex-1 glass-btn-primary py-1 rounded-lg text-xs font-medium">Add</button>
                      <button onClick={() => { setNewTaskColumn(null); setNewTaskTitle(""); }} className="glass py-1 px-2 rounded-lg text-xs text-muted hover:text-white">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewTaskColumn(col.id)}
                    className="w-full text-left px-2 py-2 rounded-xl text-sm text-muted hover:text-white hover:bg-white/[0.04] transition-glass flex items-center gap-2"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative glass-heavy rounded-2xl p-6 w-full max-w-lg animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <PriorityDot priority={selectedTask.priority} />
              <h2 className="font-bold text-lg flex-1 leading-snug">{selectedTask.title}</h2>
              <button onClick={() => setSelectedTask(null)} className="text-muted hover:text-white p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {selectedTask.description && (
              <p className="text-subtle text-sm mb-4 leading-relaxed">{selectedTask.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="glass rounded-xl p-3">
                <p className="text-muted text-xs mb-1">Priority</p>
                <div className="flex items-center gap-1.5">
                  <PriorityDot priority={selectedTask.priority} />
                  <span>{PRIORITY_COLORS[selectedTask.priority as keyof typeof PRIORITY_COLORS]?.label}</span>
                </div>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-muted text-xs mb-1">Assignee</p>
                {selectedTask.assignee ? (
                  <div className="flex items-center gap-1.5">
                    {selectedTask.assignee.image && <img src={selectedTask.assignee.image} alt="" className="w-5 h-5 rounded-full" />}
                    <span className="truncate">{selectedTask.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-muted">Unassigned</span>
                )}
              </div>
              {selectedTask.dueDate && (
                <div className="glass rounded-xl p-3">
                  <p className="text-muted text-xs mb-1">Due date</p>
                  <span className={new Date(selectedTask.dueDate) < new Date() ? "text-red-400" : ""}>
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="glass rounded-xl p-3">
                <p className="text-muted text-xs mb-1">Created by</p>
                <div className="flex items-center gap-1.5">
                  {selectedTask.creator.image && <img src={selectedTask.creator.image} alt="" className="w-5 h-5 rounded-full" />}
                  <span className="truncate">{selectedTask.creator.name}</span>
                </div>
              </div>
            </div>

            {selectedTask.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedTask.labels.map((l) => (
                  <span key={l} className="glass text-xs px-2 py-1 rounded-full text-muted">{l}</span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => deleteTask(selectedTask.id, selectedTask.columnId)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-glass"
              >
                Delete task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
