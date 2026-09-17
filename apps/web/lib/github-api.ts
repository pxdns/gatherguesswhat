// GitHub API client — uses the user's stored OAuth access token

export interface GitHubOrg {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
  public_repos: number;
  total_private_repos?: number;
  members_count?: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  open_issues_count: number;
  default_branch: string;
}

export interface GitHubMember {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: { login: string; avatar_url: string };
  repo: { name: string; url: string };
  payload: any;
  created_at: string;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
  draft: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  labels: { name: string; color: string }[];
  created_at: string;
  updated_at: string;
}

class GitHubAPIClient {
  private baseUrl = "https://api.github.com";

  private async fetch<T>(
    path: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...options.headers,
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`GitHub API ${path} → ${res.status}: ${text}`);
    }
    return res.json();
  }

  async getUserOrgs(token: string): Promise<GitHubOrg[]> {
    return this.fetch<GitHubOrg[]>("/user/orgs?per_page=100", token);
  }

  async getOrg(token: string, org: string): Promise<GitHubOrg> {
    return this.fetch<GitHubOrg>(`/orgs/${org}`, token);
  }

  async getOrgMembers(token: string, org: string): Promise<GitHubMember[]> {
    return this.fetch<GitHubMember[]>(
      `/orgs/${org}/members?per_page=100`,
      token
    );
  }

  async getOrgRepos(token: string, org: string): Promise<GitHubRepo[]> {
    return this.fetch<GitHubRepo[]>(
      `/orgs/${org}/repos?per_page=50&sort=updated`,
      token
    );
  }

  async getUserRepos(token: string): Promise<GitHubRepo[]> {
    return this.fetch<GitHubRepo[]>(
      "/user/repos?per_page=50&sort=updated&affiliation=owner,collaborator",
      token
    );
  }

  async getRepoEvents(
    token: string,
    owner: string,
    repo: string
  ): Promise<GitHubEvent[]> {
    return this.fetch<GitHubEvent[]>(
      `/repos/${owner}/${repo}/events?per_page=30`,
      token
    );
  }

  async getRepoPRs(
    token: string,
    owner: string,
    repo: string
  ): Promise<GitHubPR[]> {
    return this.fetch<GitHubPR[]>(
      `/repos/${owner}/${repo}/pulls?state=open&per_page=20`,
      token
    );
  }

  async getRepoIssues(
    token: string,
    owner: string,
    repo: string
  ): Promise<GitHubIssue[]> {
    return this.fetch<GitHubIssue[]>(
      `/repos/${owner}/${repo}/issues?state=open&per_page=20&pulls=false`,
      token
    );
  }

  async getUserActivity(
    token: string,
    username: string
  ): Promise<GitHubEvent[]> {
    return this.fetch<GitHubEvent[]>(
      `/users/${username}/events?per_page=30`,
      token
    );
  }
}

export const githubAPI = new GitHubAPIClient();
