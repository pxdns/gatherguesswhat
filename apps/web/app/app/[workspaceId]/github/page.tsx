"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface GitHubOrg {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  open_issues_count: number;
  html_url: string;
}

interface GitHubMember {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  created_at: string;
  draft: boolean;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  labels: { name: string; color: string }[];
  created_at: string;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572a5",
  Rust: "#ce422b", Go: "#00add8", "C++": "#f34b7d", Java: "#b07219",
  Ruby: "#701516", Swift: "#fa7343", Kotlin: "#a97bff", CSS: "#563d7c",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function GitHubPage() {
  const params = useParams();
  const [orgs, setOrgs] = useState<GitHubOrg[]>([]);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [orgRepos, setOrgRepos] = useState<GitHubRepo[]>([]);
  const [orgMembers, setOrgMembers] = useState<GitHubMember[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [prs, setPRs] = useState<GitHubPR[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"prs" | "issues">("prs");

  useEffect(() => {
    fetch("/api/github/orgs")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setOrgs(d.orgs || []);
        setRepos(d.repos || []);
      })
      .catch(() => setError("Failed to load GitHub data"))
      .finally(() => setLoading(false));
  }, []);

  const loadOrg = async (org: string) => {
    setSelectedOrg(org);
    setSelectedRepo(null);
    const res = await fetch(`/api/github/repos?org=${encodeURIComponent(org)}`);
    const d = await res.json();
    setOrgRepos(d.repos || []);
    setOrgMembers(d.members || []);
  };

  const loadRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    const [owner, name] = repo.full_name.split("/");
    const res = await fetch(`/api/github/repos?owner=${owner}&repo=${name}`);
    const d = await res.json();
    setPRs(d.prs || []);
    setIssues(d.issues || []);
  };

  const addRepoChannel = async (repo: GitHubRepo) => {
    const [owner, name] = repo.full_name.split("/");
    // Get workspace id from slug
    const wsRes = await fetch(`/api/workspaces/${params.workspaceId}`);
    const wsData = await wsRes.json();
    if (!wsData.workspace) return;
    await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: wsData.workspace.id,
        name: name,
        type: "github-repo",
        description: repo.description,
        githubRepoName: name,
        githubRepoOwner: owner,
      }),
    });
    alert(`Channel #${name} created for ${repo.full_name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted text-sm animate-pulse">Loading GitHub data…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-4xl">🔗</div>
        <h2 className="font-semibold">GitHub not connected</h2>
        <p className="text-muted text-sm text-center max-w-xs">
          {error === "GitHub not connected"
            ? "Sign in with GitHub to see your organizations and repositories here."
            : error}
        </p>
      </div>
    );
  }

  const displayRepos = selectedOrg ? orgRepos : repos;

  return (
    <div className="flex h-full min-h-0">
      {/* Left: orgs + repos list */}
      <div className="w-72 glass-sidebar border-r border-white/[0.06] flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            Organizations
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedOrg(null); setSelectedRepo(null); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-glass ${!selectedOrg ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "glass text-subtle hover:text-white"}`}
            >
              Personal
            </button>
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => loadOrg(org.login)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-glass ${selectedOrg === org.login ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "glass text-subtle hover:text-white"}`}
              >
                <img src={org.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                {org.login}
              </button>
            ))}
          </div>
        </div>

        {/* Members (when org selected) */}
        {selectedOrg && orgMembers.length > 0 && (
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-xs text-muted mb-2 font-semibold uppercase tracking-wider">Members</p>
            <div className="flex flex-wrap gap-1">
              {orgMembers.slice(0, 12).map((m) => (
                <a key={m.id} href={m.html_url} target="_blank" rel="noopener noreferrer" data-tooltip={m.login}>
                  <img src={m.avatar_url} alt={m.login} className="w-6 h-6 rounded-full hover:ring-2 ring-indigo-400 transition-all" />
                </a>
              ))}
              {orgMembers.length > 12 && (
                <div className="w-6 h-6 rounded-full glass flex items-center justify-center text-[10px] text-muted">
                  +{orgMembers.length - 12}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Repos list */}
        <div className="flex-1 overflow-y-auto py-2">
          {displayRepos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => loadRepo(repo)}
              className={`w-full text-left px-4 py-2.5 hover:bg-white/[0.04] transition-glass ${selectedRepo?.id === repo.id ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium truncate flex-1 text-subtle hover:text-white">
                  {repo.name}
                </span>
                {repo.private && (
                  <span className="text-[10px] glass px-1.5 py-0.5 rounded text-muted">private</span>
                )}
              </div>
              {repo.description && (
                <p className="text-[11px] text-muted truncate mt-0.5">{repo.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {repo.language && (
                  <span className="flex items-center gap-1 text-[10px] text-muted">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: LANG_COLORS[repo.language] || "#6b7280" }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="text-[10px] text-muted">⭐ {repo.stargazers_count}</span>
                <span className="text-[10px] text-muted">{timeAgo(repo.updated_at)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: repo detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedRepo ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">🗂</div>
            <h2 className="font-semibold text-lg mb-1">Select a repository</h2>
            <p className="text-muted text-sm">Click any repo to see its PRs, issues, and activity</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Repo header */}
            <div className="glass rounded-2xl p-5 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <a
                    href={selectedRepo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-bold hover:text-indigo-400 transition-colors"
                  >
                    {selectedRepo.full_name}
                  </a>
                  {selectedRepo.description && (
                    <p className="text-muted text-sm mt-1">{selectedRepo.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted">
                    {selectedRepo.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: LANG_COLORS[selectedRepo.language] || "#6b7280" }}
                        />
                        {selectedRepo.language}
                      </span>
                    )}
                    <span>⭐ {selectedRepo.stargazers_count}</span>
                    <span>🍴 {selectedRepo.forks_count}</span>
                    <span>🐛 {selectedRepo.open_issues_count} open</span>
                  </div>
                </div>
                <button
                  onClick={() => addRepoChannel(selectedRepo)}
                  className="glass-btn px-3 py-1.5 rounded-xl text-xs font-medium shrink-0"
                >
                  + Add to Sidebar
                </button>
              </div>
            </div>

            {/* PR / Issues tabs */}
            <div className="flex gap-1 mb-4 glass p-1 rounded-xl w-fit">
              {(["prs", "issues"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-glass ${
                    tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-muted hover:text-white"
                  }`}
                >
                  {t === "prs" ? `Pull Requests (${prs.length})` : `Issues (${issues.length})`}
                </button>
              ))}
            </div>

            {tab === "prs" ? (
              <div className="space-y-2">
                {prs.length === 0 ? (
                  <p className="text-muted text-sm text-center py-8">No open pull requests</p>
                ) : (
                  prs.map((pr) => (
                    <a
                      key={pr.id}
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 glass rounded-xl p-4 hover:bg-white/[0.06] transition-glass"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pr.draft ? "#6b7280" : "#22c55e"} strokeWidth="2" className="mt-0.5 shrink-0">
                        <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
                        <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{pr.title}</p>
                        <p className="text-xs text-muted mt-0.5">
                          #{pr.number} by {pr.user.login} · {timeAgo(pr.created_at)}
                          {pr.draft && " · Draft"}
                        </p>
                      </div>
                      <img src={pr.user.avatar_url} alt="" className="w-6 h-6 rounded-full shrink-0" />
                    </a>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {issues.length === 0 ? (
                  <p className="text-muted text-sm text-center py-8">No open issues</p>
                ) : (
                  issues.map((issue) => (
                    <a
                      key={issue.id}
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 glass rounded-xl p-4 hover:bg-white/[0.06] transition-glass"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="mt-0.5 shrink-0">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{issue.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted">#{issue.number} by {issue.user.login} · {timeAgo(issue.created_at)}</span>
                          {issue.labels.slice(0, 3).map((l) => (
                            <span
                              key={l.name}
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: `#${l.color}20`, color: `#${l.color}`, border: `1px solid #${l.color}40` }}
                            >
                              {l.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <img src={issue.user.avatar_url} alt="" className="w-6 h-6 rounded-full shrink-0" />
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
