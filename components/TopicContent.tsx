'use client'

import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Topic, TradeoffEntry } from '@/lib/topics'

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), { ssr: false })

interface Props {
  topic: Topic
  color: string
}

const SECTION_ICONS: Record<string, string> = {
  problem: '⚡',
  need: '🔍',
  analogy: '💡',
  solution: '✦',
  keyTerms: '📖',
  howItWorks: '⚙',
  code: '</>',
  tradeoffs: '⚖',
  gcpMapping: '☁',
  diagram: '◈',
  checkQuestion: '?',
}

const SECTION_LABELS: Record<string, string> = {
  problem: 'Problem',
  need: 'Why It Fails',
  analogy: 'Analogy',
  solution: 'Solution',
  keyTerms: 'Key Terms',
  howItWorks: 'How It Works',
  code: 'Code',
  tradeoffs: 'Tradeoffs',
  gcpMapping: 'GCP Mapping',
  diagram: 'Diagram',
  checkQuestion: 'Check Your Understanding',
}

const TRADEOFF_COLORS: Record<string, string> = {
  Performance: '#5B6AF0',
  Cost: '#10B981',
  Complexity: '#F59E0B',
  Reliability: '#EF4444',
  Scalability: '#8B5CF6',
}

export default function TopicContent({ topic, color }: Props) {
  const { sections } = topic

  const orderedSections = [
    'problem', 'need', 'analogy', 'solution', 'keyTerms',
    'howItWorks', 'code', 'tradeoffs', 'gcpMapping', 'diagram', 'checkQuestion',
  ]

  return (
    <div>
      {orderedSections.map(key => {
        const value = (sections as Record<string, unknown>)[key]
        if (!value) return null

        return (
          <section key={key} id={key} style={{ marginBottom: '48px' }}>
            <SectionHeader sectionKey={key} color={color} />

            {key === 'tradeoffs' && Array.isArray(value) ? (
              <TradeoffsSection entries={value as TradeoffEntry[]} />
            ) : key === 'diagram' && typeof value === 'string' ? (
              <DiagramSection content={value} />
            ) : key === 'code' && typeof value === 'string' ? (
              <CodeSection content={value} />
            ) : key === 'checkQuestion' && typeof value === 'string' ? (
              <CheckSection
                question={value}
                answer={sections.checkAnswer}
                color={color}
              />
            ) : typeof value === 'string' ? (
              <MarkdownSection content={value} />
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

function SectionHeader({ sectionKey, color }: { sectionKey: string; color: string }) {
  const icon = SECTION_ICONS[sectionKey] || '◎'
  const label = SECTION_LABELS[sectionKey] || sectionKey

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
    }}>
      <div style={{
        width: 32, height: 32,
        background: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.85rem',
        color,
        fontFamily: 'Syne, sans-serif',
        fontWeight: 700,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <h2 style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        fontSize: '1.15rem',
        color: '#E8E8EE',
        margin: 0,
        letterSpacing: '-0.01em',
      }}>
        {label}
      </h2>
    </div>
  )
}

function MarkdownSection({ content }: { content: string }) {
  return (
    <div style={{
      background: '#18181C',
      border: '1px solid #2A2A30',
      borderRadius: '12px',
      padding: '24px',
      lineHeight: 1.7,
      fontSize: '0.95rem',
      color: '#D0D0DC',
    }}>
      <div className="prose prose-invert max-w-none" style={{ color: '#D0D0DC' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

function CodeSection({ content }: { content: string }) {
  // Extract lang and code from fenced block if present
  const fenceMatch = content.match(/^```(\w*)\n([\s\S]*?)```$/m)
  const lang = fenceMatch?.[1] || 'text'
  const code = fenceMatch?.[2] || content

  return (
    <div style={{
      background: '#13131A',
      border: '1px solid #2A2A30',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid #2A2A30',
        background: '#18181C',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#FF5F57', '#FFBD2E', '#28CA41'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <span style={{ fontSize: '0.72rem', color: '#6B6B7A', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>
          {lang || 'pseudocode'}
        </span>
      </div>
      <pre style={{
        margin: 0,
        padding: '20px',
        overflowX: 'auto',
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.875rem',
        lineHeight: 1.7,
        color: '#A8B4FF',
        background: 'transparent',
        border: 'none',
      }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function TradeoffsSection({ entries }: { entries: TradeoffEntry[] }) {
  if (!entries || entries.length === 0) return null

  return (
    <div style={{
      background: '#18181C',
      border: '1px solid #2A2A30',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '130px 1fr',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#6B6B7A',
        padding: '10px 20px',
        borderBottom: '1px solid #2A2A30',
        background: '#1E1E28',
        fontFamily: 'Syne, sans-serif',
      }}>
        <span>Dimension</span>
        <span>Impact</span>
      </div>
      {entries.map((entry, i) => {
        const axisColor = TRADEOFF_COLORS[entry.axis] || '#5B6AF0'
        return (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr',
            padding: '14px 20px',
            borderBottom: i < entries.length - 1 ? '1px solid #1E1E28' : 'none',
            alignItems: 'start',
            gap: '12px',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              background: `${axisColor}18`,
              border: `1px solid ${axisColor}40`,
              borderRadius: 20,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: axisColor,
              fontFamily: 'Syne, sans-serif',
              letterSpacing: '0.04em',
              width: 'fit-content',
            }}>
              {entry.axis}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#E8E8EE', fontWeight: 600, marginBottom: entry.detail ? '4px' : 0 }}>
                {entry.impact}
              </div>
              {entry.detail && (
                <div style={{ fontSize: '0.82rem', color: '#9898A8', lineHeight: 1.5 }}>
                  {entry.detail}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DiagramSection({ content }: { content: string }) {
  // Extract mermaid code if wrapped in ```mermaid fence
  const fenceMatch = content.match(/```mermaid\n([\s\S]*?)```/)
  const chart = fenceMatch?.[1] || content

  return <MermaidDiagram chart={chart} />
}

function CheckSection({ question, answer, color }: { question: string; answer?: string; color: string }) {
  return (
    <div style={{
      background: `${color}08`,
      border: `1px solid ${color}30`,
      borderRadius: '12px',
      padding: '24px',
    }}>
      <div style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        color: color,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: 'Syne, sans-serif',
        marginBottom: '12px',
      }}>
        ✦ Design Reasoning Question
      </div>
      <div style={{
        fontSize: '1rem',
        color: '#E8E8EE',
        lineHeight: 1.6,
        fontWeight: 500,
        marginBottom: answer ? '20px' : 0,
      }}>
        {question}
      </div>
      {answer && (
        <details style={{ marginTop: '16px' }}>
          <summary style={{
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: color,
            fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            userSelect: 'none',
          }}>
            Reveal answer
          </summary>
          <div style={{
            marginTop: '14px',
            padding: '16px',
            background: '#18181C',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#D0D0DC',
            lineHeight: 1.6,
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          </div>
        </details>
      )}
    </div>
  )
}
