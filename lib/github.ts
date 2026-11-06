// Build-time GitHub data (re-fetched at most once a day). Falls back to null when offline/rate-limited.
export type GHRepo = { name: string; description: string | null; url: string; language: string | null; stars: number; forks: number; updated: string };
export type GHUser = { login: string; name: string | null; avatar: string; bio: string | null; url: string; repos: number; followers: number; following: number };

async function get<T>(url: string): Promise<T | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-site' },
      next: { revalidate: 86400 },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type Day = { date: string; count: number; level: number };

/** Daily contribution counts (public, no token). Returns null when unreachable so the page falls back to an image. */
async function getContributions(user: string): Promise<Day[] | null> {
  const d = await get<{ contributions?: Day[] }>(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`);
  const list = d?.contributions;
  if (!Array.isArray(list) || !list.length || typeof list[0]?.date !== 'string') return null;
  return list
    .map((x) => ({ date: x.date, count: Number(x.count) || 0, level: Math.max(0, Math.min(4, Number(x.level) || 0)) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getGitHub(user?: string | null) {
  if (!user) return null;
  const [u, r, days] = await Promise.all([
    get<any>(`https://api.github.com/users/${user}`),
    get<any[]>(`https://api.github.com/users/${user}/repos?sort=updated&per_page=12`),
    getContributions(user),
  ]);
  const profile: GHUser | null = u
    ? { login: u.login, name: u.name, avatar: u.avatar_url, bio: u.bio, url: u.html_url, repos: u.public_repos, followers: u.followers, following: u.following }
    : null;
  const repos: GHRepo[] = (r ?? [])
    .filter((x) => !x.fork)
    .slice(0, 4)
    .map((x) => ({ name: x.name, description: x.description, url: x.html_url, language: x.language, stars: x.stargazers_count, forks: x.forks_count, updated: x.pushed_at }));
  return { profile, repos, days };
}
