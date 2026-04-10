'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

const TEMPLATE = `---
title: "Topic Title Here"
stage: 1
date: "${new Date().toISOString().split('T')[0]}"
summary: "One-line summary of what this topic covers."
tags: ["tag1", "tag2"]
gcpServices: ["Cloud Memorystore", "Cloud Pub/Sub"]
---

## PROBLEM

Describe the real-world scenario here. Put the reader inside the pain. No definitions yet.

## NEED

Explain exactly why the naive approach fails — what breaks, at what scale, and why more of the same won't fix it.

## ANALOGY

One clear real-world analogy that creates the cognitive bridge before the technical explanation.

## SOLUTION

**Concept Name**: One-sentence crisp definition. The reader already understands why it exists — now give it a name.

## KEY TERMS

- **Term 1**: Definition
- **Term 2**: Definition
- **Term 3**: Definition

## HOW IT WORKS

Step-by-step internal flow:

1. Step one — what happens first
2. Step two — what changes internally
3. Step three — success path
4. Step four — failure path and how it's handled

## CODE

\`\`\`python
# Critical path implementation
# Show just the core logic — not a full system

def example_function():
    pass
\`\`\`

## TRADEOFFS

**Performance**: High / Medium / Low — explanation of latency/throughput impact

**Cost**: High / Medium / Low — infra and operational cost

**Complexity**: High / Medium / Low — implementation + ops complexity

**Reliability**: Improved / Neutral / Degraded — failure modes introduced or mitigated

**Scalability**: How behavior changes at 10x, 100x load

## GCP MAPPING

- **Direct Service**: [GCP Service Name] — how it implements this concept
- **Internal Usage**: Where GCP uses this concept internally (if no direct service)
- **Config Example**: Any relevant GCP-specific configuration note

## DIAGRAM

\`\`\`mermaid
flowchart TD
    A[Client] --> B[Component]
    B --> C[Output]
\`\`\`

## CHECK QUESTION

Write the design reasoning question here. Tie it to NoteFlow where possible. Make the answer non-obvious.

## CHECK ANSWER

Write the full answer here. This is hidden behind a "Reveal answer" toggle on the site.
`

export default function AdminPage() {
  const [content, setContent] = useState('')
  const [filename, setFilename] = useState('')
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.md')) {
      setErrorMsg('Only .md files are accepted.')
      setStatus('error')
      return
    }
    setFilename(file.name.replace('.md', '').toLowerCase().replace(/\s+/g, '-'))
    const reader = new FileReader()
    reader.onload = e => setContent(e.target?.result as string || '')
    reader.readAsText(file)
    setStatus('idle')
    setErrorMsg('')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleUpload = async () => {
    if (!content || !filename) return
    setStatus('uploading')
    try {
      const res = await fetch('/api/upload-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: filename, content }),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus('success')
    } catch (e) {
      setErrorMsg(String(e))
      setStatus('error')
    }
  }

  const copyTemplate = () => {
    navigator.clipboard.writeText(TEMPLATE)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0F' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid #2A2A30',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0,
        background: 'rgba(13,13,15,0.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          textDecoration: 'none', color: '#9898A8',
          fontSize: '0.85rem', fontFamily: 'Syne, sans-serif', fontWeight: 600,
        }}>
          ← Back to site
        </Link>
        <span style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: '0.9rem', color: '#E8E8EE',
        }}>
          Upload Topic
        </span>
      </nav>

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '2rem', color: '#E8E8EE',
          letterSpacing: '-0.02em', marginBottom: '8px',
        }}>
          Publish a Learning Session
        </h1>
        <p style={{ color: '#9898A8', marginBottom: '40px', fontSize: '0.95rem' }}>
          Complete a learning session with Claude, get the markdown file, and upload it here. The site will render all 11 sections automatically.
        </p>

        {/* Step 1: Get template */}
        <StepCard number="01" title="Get the markdown template" color="#5B6AF0">
          <p style={{ color: '#9898A8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
            Ask Claude: <em style={{ color: '#7B8AF8' }}>"Generate the learning markdown file for [topic name]"</em> — Claude will fill the full 11-section format based on your session.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPreview(!preview)}
              style={{
                padding: '8px 18px',
                background: '#18181C',
                border: '1px solid #2A2A30',
                borderRadius: 8,
                color: '#E8E8EE',
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
              }}
            >
              {preview ? 'Hide template' : 'Preview template'}
            </button>
            <button
              onClick={copyTemplate}
              style={{
                padding: '8px 18px',
                background: '#5B6AF0',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
              }}
            >
              Copy template
            </button>
          </div>

          {preview && (
            <pre style={{
              marginTop: '16px',
              padding: '16px',
              background: '#13131A',
              border: '1px solid #2A2A30',
              borderRadius: 8,
              fontSize: '0.78rem',
              color: '#9898A8',
              overflowX: 'auto',
              fontFamily: 'DM Mono, monospace',
              lineHeight: 1.6,
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              {TEMPLATE}
            </pre>
          )}
        </StepCard>

        {/* Step 2: Upload file */}
        <StepCard number="02" title="Upload your markdown file" color="#10B981">

          {/* Filename */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', color: '#9898A8', fontFamily: 'Syne, sans-serif', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              File slug (URL path)
            </label>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. caching-strategies"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#18181C',
                border: '1px solid #2A2A30',
                borderRadius: 8,
                color: '#E8E8EE',
                fontSize: '0.9rem',
                fontFamily: 'DM Mono, monospace',
                outline: 'none',
              }}
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? '#10B981' : '#2A2A30'}`,
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              background: dragOver ? '#10B98108' : '#18181C',
              transition: 'all 0.2s',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>◈</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8EE', marginBottom: '6px' }}>
              {content ? '✓ File loaded' : 'Drop .md file here'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6B6B7A' }}>
              {content ? `${content.split('\n').length} lines ready to publish` : 'or click to browse'}
            </div>
            <input
              id="file-input"
              type="file"
              accept=".md"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
            />
          </div>

          {/* OR paste */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', color: '#9898A8', fontFamily: 'Syne, sans-serif', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Or paste content directly
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste your markdown content here..."
              rows={8}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#18181C',
                border: '1px solid #2A2A30',
                borderRadius: 8,
                color: '#E8E8EE',
                fontSize: '0.82rem',
                fontFamily: 'DM Mono, monospace',
                resize: 'vertical',
                outline: 'none',
                lineHeight: 1.6,
              }}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!content || !filename || status === 'uploading'}
            style={{
              padding: '12px 28px',
              background: content && filename ? '#10B981' : '#2A2A30',
              border: 'none',
              borderRadius: 8,
              color: content && filename ? 'white' : '#6B6B7A',
              fontSize: '0.9rem',
              cursor: content && filename ? 'pointer' : 'not-allowed',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >
            {status === 'uploading' ? 'Publishing…' : 'Publish topic →'}
          </button>

          {status === 'success' && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#10B98115',
              border: '1px solid #10B98140',
              borderRadius: 8,
              color: '#10B981',
              fontSize: '0.875rem',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
            }}>
              ✓ Topic published! <Link href={`/topic/${filename}`} style={{ color: '#10B981', marginLeft: '8px' }}>View it →</Link>
            </div>
          )}

          {status === 'error' && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#EF444415',
              border: '1px solid #EF444440',
              borderRadius: 8,
              color: '#EF4444',
              fontSize: '0.875rem',
            }}>
              {errorMsg || 'Upload failed. Check the file format.'}
            </div>
          )}
        </StepCard>

        {/* Step 3: Format reference */}
        <StepCard number="03" title="Required frontmatter fields" color="#F59E0B">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A30' }}>
                {['Field', 'Type', 'Required', 'Example'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#9898A8', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['title', 'string', '✓', '"Caching Strategies"'],
                ['stage', 'number 1–8', '✓', '2'],
                ['date', 'YYYY-MM-DD', '✓', '"2024-01-15"'],
                ['summary', 'string', '✓', '"Why and how caching works"'],
                ['tags', 'array', '—', '["cache", "redis"]'],
                ['gcpServices', 'array', '—', '["Cloud Memorystore"]'],
              ].map(([field, type, req, ex]) => (
                <tr key={field} style={{ borderBottom: '1px solid #1E1E28' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'DM Mono, monospace', color: '#A8B4FF', fontSize: '0.82rem' }}>{field}</td>
                  <td style={{ padding: '8px 12px', color: '#9898A8', fontSize: '0.82rem' }}>{type}</td>
                  <td style={{ padding: '8px 12px', color: req === '✓' ? '#10B981' : '#6B6B7A' }}>{req}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'DM Mono, monospace', color: '#6B6B7A', fontSize: '0.78rem' }}>{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </StepCard>
      </main>
    </div>
  )
}

function StepCard({ number, title, color, children }: {
  number: string; title: string; color: string; children: React.ReactNode
}) {
  return (
    <div style={{
      background: '#18181C',
      border: '1px solid #2A2A30',
      borderRadius: '14px',
      padding: '28px',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.7rem',
          color: color, letterSpacing: '0.1em',
          padding: '3px 10px',
          background: `${color}18`,
          border: `1px solid ${color}40`,
          borderRadius: 20,
        }}>
          STEP {number}
        </div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1rem', color: '#E8E8EE', margin: 0,
        }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}
