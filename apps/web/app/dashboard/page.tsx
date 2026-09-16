"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session } = useSession();

  const stats = [
    { label: "Communities", value: "3", icon: "🏘️" },
    { label: "Active Chats", value: "8", icon: "💬" },
    { label: "Friends", value: "24", icon: "👥" },
    { label: "Messages", value: "342", icon: "📧" },
  ];

  const recentCommunities = [
    { name: "Developers", members: 245, icon: "👨‍💻" },
    { name: "Gaming", members: 1203, icon: "🎮" },
    { name: "Design", members: 342, icon: "🎨" },
  ];

  return (
    <div className="p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {session?.user?.name}! 👋
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's what's happening in your communities today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 rounded-lg shadow p-6"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Your Communities */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Communities</h2>
            <Link
              href="/communities"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentCommunities.map((community) => (
              <div
                key={community.name}
                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{community.icon}</span>
                  <div>
                    <p className="font-semibold">{community.name}</p>
                    <p className="text-xs text-slate-500">
                      {community.members} members
                    </p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/communities"
              className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-semibold text-blue-600"
            >
              <span className="text-2xl">➕</span>
              Create Community
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-semibold text-blue-600"
            >
              <span className="text-2xl">💬</span>
              View Messages
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-semibold text-blue-600"
            >
              <span className="text-2xl">⚙️</span>
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-2">Ready to explore?</h2>
        <p className="mb-4">Join communities, start conversations, and connect with others.</p>
        <Link
          href="/communities"
          className="inline-block px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-slate-100 transition"
        >
          Explore Communities
        </Link>
      </div>
    </div>
  );
}
