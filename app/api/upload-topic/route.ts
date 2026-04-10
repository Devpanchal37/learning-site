import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const DEFAULT_TOPICS_DIR = "content/topics";

interface GitTreeEntry {
  path?: string;
  type?: string;
}

interface GitTreeResponse {
  tree?: GitTreeEntry[];
}

async function resolveTopicsDirectory(): Promise<string> {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return DEFAULT_TOPICS_DIR;
  }

  const treeUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${encodeURIComponent(GITHUB_BRANCH)}?recursive=1`;
  const treeRes = await fetch(treeUrl, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!treeRes.ok) {
    return DEFAULT_TOPICS_DIR;
  }

  const data = (await treeRes.json()) as GitTreeResponse;
  const counts = new Map<string, number>();

  for (const entry of data.tree || []) {
    if (entry.type !== "blob" || !entry.path?.endsWith(".md")) continue;
    const match = entry.path.match(/^(.*content\/topics)\/[^/]+\.md$/);
    if (!match?.[1]) continue;
    counts.set(match[1], (counts.get(match[1]) || 0) + 1);
  }

  if (counts.size === 0) {
    return DEFAULT_TOPICS_DIR;
  }

  let bestDir = DEFAULT_TOPICS_DIR;
  let bestCount = counts.get(DEFAULT_TOPICS_DIR) || 0;

  for (const [dir, count] of counts.entries()) {
    const isBetter = count > bestCount;
    const isTieAndPreferDefault =
      count === bestCount &&
      bestDir !== DEFAULT_TOPICS_DIR &&
      dir === DEFAULT_TOPICS_DIR;
    if (isBetter || isTieAndPreferDefault) {
      bestDir = dir;
      bestCount = count;
    }
  }

  return bestDir;
}

export async function POST(req: NextRequest) {
  try {
    const { slug, content } = await req.json();

    if (!slug || !content) {
      return NextResponse.json(
        { error: "slug and content are required" },
        { status: 400 },
      );
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be lowercase letters, numbers, and hyphens only" },
        { status: 400 },
      );
    }
    if (!content.startsWith("---")) {
      return NextResponse.json(
        {
          error:
            "File must start with YAML frontmatter (---). Use the provided template.",
        },
        { status: 400 },
      );
    }
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return NextResponse.json(
        {
          error:
            "Server not configured. Add GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO to Vercel environment variables.",
        },
        { status: 500 },
      );
    }

    const topicsDirectory = await resolveTopicsDirectory();
    const filePath = `${topicsDirectory}/${slug}.md`;
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

    // Check if file already exists (need SHA to update)
    let existingSha: string | undefined;
    const checkRes = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      existingSha = existing.sha;
    }

    // Commit to GitHub
    const body: Record<string, string> = {
      message: existingSha ? `Update topic: ${slug}` : `Add topic: ${slug}`,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch: GITHUB_BRANCH,
    };
    if (existingSha) body.sha = existingSha;

    const commitRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(body),
    });

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return NextResponse.json(
        { error: `GitHub error: ${err.message || "Unknown error"}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      slug,
      path: filePath,
      branch: GITHUB_BRANCH,
      message: existingSha ? "Topic updated" : "Topic published",
      note: "Vercel is rebuilding. Live in ~30 seconds.",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
