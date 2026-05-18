export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string;
}

const modules = import.meta.glob('/content/blog/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    data[key] = value;
  }
  return { data, content: match[2] };
}

function parsePosts(): BlogPost[] {
  return Object.entries(modules).map(([filepath, raw]) => {
    const slug = filepath.split('/').pop()!.replace(/\.md$/, '');
    const { data, content } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title,
      date: data.date,
      summary: data.summary,
      content,
    };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

let cached: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (!cached) cached = parsePosts();
  return cached;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find(p => p.slug === slug);
}
