"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Community {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  memberCount: number;
  isMember: boolean;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/communities")
      .then((r) => r.json())
      .then(setCommunities)
      .catch(() => setError("Failed to load communities"));
  }

  useEffect(load, []);

  async function handleCreate() {
    if (!newCommunity.name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCommunity),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create community");
        return;
      }
      setCommunities((prev) => (prev ? [data, ...prev] : [data]));
      setNewCommunity({ name: "", description: "" });
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin(id: string) {
    setJoiningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/communities/${id}/join`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to join");
        return;
      }
      setCommunities(
        (prev) =>
          prev?.map((c) =>
            c.id === id ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c
          ) || null
      );
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Communities</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join or create communities to connect with others
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          + Create
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create Community</h2>
            <input
              type="text"
              placeholder="Community name"
              value={newCommunity.name}
              onChange={(e) =>
                setNewCommunity({ ...newCommunity, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 mb-4"
            />
            <textarea
              placeholder="Description"
              value={newCommunity.description}
              onChange={(e) =>
                setNewCommunity({ ...newCommunity, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 mb-4 resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Communities Grid */}
      {communities === null ? (
        <p className="text-slate-500">Loading communities...</p>
      ) : communities.length === 0 ? (
        <p className="text-slate-500">No communities yet. Create the first one!</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <div
              key={community.id}
              className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-3">{community.icon || "🌐"}</div>
              <h3 className="text-xl font-bold mb-2">{community.name}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                {community.description || "No description yet"}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  👥 {community.memberCount} member{community.memberCount === 1 ? "" : "s"}
                </span>
                {community.isMember ? (
                  <Link
                    href={`/messages?communityId=${community.id}`}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    Open
                  </Link>
                ) : (
                  <button
                    onClick={() => handleJoin(community.id)}
                    disabled={joiningId === community.id}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition disabled:opacity-50"
                  >
                    {joiningId === community.id ? "..." : "Join"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
