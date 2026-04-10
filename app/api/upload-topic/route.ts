import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

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

    const filePath = `content/topics/${slug}.md`;
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
