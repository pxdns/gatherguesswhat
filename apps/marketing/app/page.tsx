import Link from "next/link";

const FEATURES = [
  {
    icon: "◈",
    title: "GitHub-Native",
    desc: "Connect your orgs and repos. See PRs, issues, and activity without leaving your workspace.",
  },
  {
    icon: "✦",
    title: "AI Built In",
    desc: "Vertex AI (powered by Claude) helps your team write code, review PRs, and plan sprints.",
  },
  {
    icon: "◻",
    title: "Kanban & Roadmaps",
    desc: "Track tasks on a drag-and-drop board. Visualize milestones on a beautiful timeline.",
  },
  {
    icon: "◈",
    title: "Channels & Threads",
    desc: "Organized chat with threads, reactions, pinning, and file sharing. Less noise, more signal.",
  },
  {
    icon: "◻",
    title: "Desktop App",
    desc: "Native desktop app with system tray, notifications, and local repo detection.",
  },
  {
    icon: "✦",
    title: "Forum & Docs",
    desc: "Long-form discussions and pinnable knowledge that sticks around — not buried in chat.",
  },
];

const QUOTES = [
  {
    quote: "Vertex replaced three separate tools for our team. GitHub, Jira, and Slack — all in one.",
    name: "Sarah Chen",
    role: "Engineering Lead",
  },
  {
    quote: "The AI assistant actually understands our codebase. It's like having an extra senior engineer.",
    name: "Marcus Rodriguez",
    role: "CTO",
  },
  {
    quote: "Finally a collaboration tool built for developers, not project managers.",
    name: "Priya Patel",
    role: "Staff Engineer",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/[0.06] backdrop-blur-xl bg-black/30">
        <div className="flex items-center gap-2 font-bold text-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 22,20 2,20" fill="url(#vg)" />
            <defs>
              <linearGradient id="vg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>
          </svg>
          Vertex
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
          <Link
            href="/signin"
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center pt-40 pb-24 px-6">
        {/* Glow blob */}
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)" }}
        />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 mb-8 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Now in public beta
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-none tracking-tight">
            The collaboration platform<br />
            <span className="gradient-text">built for engineers</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
            GitHub-native workspaces. AI that knows your codebase. Channels, tasks, roadmaps, and docs — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signin"
              className="px-8 py-3.5 rounded-2xl font-bold text-base bg-indigo-600 hover:bg-indigo-500 transition-colors glow"
            >
              Start for free
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-2xl font-bold text-base glass-card hover:bg-white/[0.07] transition-colors"
            >
              See how it works →
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything your team needs
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-lg mx-auto">
            One workspace that replaces the sprawl of tools your team already uses.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card p-6 hover:bg-white/[0.06] transition-colors">
                <div className="text-indigo-400 text-2xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GitHub integration highlight */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your GitHub org, <span className="gradient-text">as a workspace</span>
          </h2>
          <p className="text-slate-400 mb-12 max-w-lg mx-auto">
            Sign in with GitHub and your org becomes your workspace. Members, repos, PRs, and issues — all connected.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {["Org members", "Repo channels", "PR feed", "Issue tracking", "Activity stream", "Team presence"].map((item) => (
              <div key={item} className="glass-card py-3 px-4 flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Loved by engineering teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUOTES.map((q) => (
              <div key={q.name} className="glass-card p-6">
                <p className="text-sm text-slate-300 leading-relaxed mb-4">"{q.quote}"</p>
                <p className="font-semibold text-sm">{q.name}</p>
                <p className="text-xs text-slate-500">{q.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Free to get started
          </h2>
          <p className="text-slate-400 mb-10">
            Vertex is free for teams up to 10. No credit card required. Upgrade when you need more.
          </p>
          <Link
            href="/signin"
            className="inline-block px-10 py-4 rounded-2xl font-bold text-lg bg-indigo-600 hover:bg-indigo-500 transition-colors glow"
          >
            Create your workspace
          </Link>
          <p className="text-xs text-slate-500 mt-4">Sign in with GitHub or Google in seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 22,20 2,20" fill="#6366f1" />
          </svg>
          Vertex
        </div>
        <p>© {new Date().getFullYear()} Vertex. Built for teams who ship.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
