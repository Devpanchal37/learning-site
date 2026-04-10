# System Design Mastery — Learning Journal

A structured learning journal for system design. Every topic follows the 11-step teaching framework: Problem → Need → Analogy → Solution → Key Terms → How It Works → Code → Tradeoffs → GCP Mapping → Diagram → Check.

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework: Next.js (auto-detected)
4. Click Deploy

That's it. Every time you push new `.md` files to `content/topics/`, Vercel rebuilds automatically.

## Adding a New Topic

### Option A — Admin panel (on deployed site)
1. Go to `your-site.vercel.app/admin`
2. Get the markdown template, fill it via Claude
3. Paste or upload the `.md` file
4. Click "Publish topic"

### Option B — Direct file drop (recommended for Vercel)
1. Ask Claude: *"Generate the learning markdown file for [topic]"*
2. Save the file as `content/topics/your-topic-slug.md`
3. Push to GitHub → Vercel auto-deploys

## Markdown File Format

Every topic file must follow this exact structure:

```
---
title: "Topic Title"
stage: 1          # 1–8 (see stages below)
date: "YYYY-MM-DD"
summary: "One-line description"
tags: ["tag1", "tag2"]
gcpServices: ["Cloud Memorystore"]
---

## PROBLEM
## NEED
## ANALOGY
## SOLUTION
## KEY TERMS
## HOW IT WORKS
## CODE
## TRADEOFFS
## GCP MAPPING
## DIAGRAM
## CHECK QUESTION
## CHECK ANSWER
```

## Stages

| # | Stage |
|---|-------|
| 1 | Fundamentals |
| 2 | Core Building Blocks |
| 3 | Database Deep Dive |
| 4 | Distributed Systems |
| 5 | API Design |
| 6 | Design Patterns |
| 7 | Real-World Systems |
| 8 | Production Concerns |

## Tradeoffs Format

In the `## TRADEOFFS` section, use this exact format so the table renders correctly:

```
**Performance**: High — explanation here

**Cost**: Medium — explanation here

**Complexity**: High — explanation here

**Reliability**: Improved — explanation here

**Scalability**: explanation here
```

## Mermaid Diagrams

In the `## DIAGRAM` section, wrap mermaid code in a fenced block:

```
    ```mermaid
    flowchart TD
        A[Client] --> B[Load Balancer]
        B --> C[Server]
    ```
```

Supported diagram types: `flowchart TD`, `sequenceDiagram`, `stateDiagram-v2`
