"use client";

import { useState } from "react";

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  icon: string;
}

const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Developers",
    description: "Community for developers",
    members: 245,
    icon: "👨‍💻",
  },
  {
    id: "2",
    name: "Gaming",
    description: "Gaming community",
    members: 1203,
    icon: "🎮",
  },
  {
    id: "3",
    name: "Design",
    description: "Design enthusiasts",
    members: 342,
    icon: "🎨",
  },
];

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>(mockCommunities);
  const [showCreate, setShowCreate] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });

  const handleCreate = () => {
    if (newCommunity.name.trim()) {
      const community: Community = {
        id: Date.now().toString(),
        name: newCommunity.name,
        description: newCommunity.description,
        members: 1,
        icon: "🌐",
      };
      setCommunities([...communities, community]);
      setNewCommunity({ name: "", description: "" });
      setShowCreate(false);
    }
  };

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
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Create
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <div
            key={community.id}
            className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-3">{community.icon}</div>
            <h3 className="text-xl font-bold mb-2">{community.name}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              {community.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                👥 {community.members} members
              </span>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
