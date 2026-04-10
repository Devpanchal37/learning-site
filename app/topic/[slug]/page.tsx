import { getTopic, getAllTopics, type TopicSections } from '@/lib/topics'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TopicContent from '@/components/TopicContent'

export async function generateStaticParams() {
  const topics = getAllTopics()
  return topics.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const topic = getTopic(params.slug)
  if (!topic) return {}
  return { title: `${topic.title} — System Design Mastery` }
}

const STAGE_COLORS: Record<number, string> = {
  1: '#5B6AF0', 2: '#10B981', 3: '#F59E0B', 4: '#EF4444',
  5: '#8B5CF6', 6: '#EC4899', 7: '#14B8A6', 8: '#F97316',
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const topic = getTopic(params.slug)
  if (!topic) notFound()

  const color = STAGE_COLORS[topic.stage] || '#5B6AF0'
  const allTopics = getAllTopics()
  const currentIndex = allTopics.findIndex(t => t.slug === topic.slug)
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

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
        position: 'sticky',
        top: 0,
        background: 'rgba(13,13,15,0.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          textDecoration: 'none', color: '#9898A8', fontSize: '0.85rem',
          fontFamily: 'Syne, sans-serif', fontWeight: 600,
        }}>
          ← Back
        </Link>
        <div style={{
          padding: '4px 12px',
          background: `${color}18`,
          border: `1px solid ${color}44`,
          borderRadius: 20,
          fontSize: '0.72rem',
          fontWeight: 700,
          color: color,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'Syne, sans-serif',
        }}>
          Stage {topic.stage} — {topic.stageLabel}
        </div>
      </nav>

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            color: '#E8E8EE',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '16px',
          }}>
            {topic.title}
          </h1>

          {topic.summary && (
            <p style={{ color: '#9898A8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {topic.summary}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {topic.date && (
              <span style={{ fontSize: '0.78rem', color: '#6B6B7A' }}>
                {new Date(topic.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {topic.tags.map(tag => (
              <span key={tag} style={{
                padding: '3px 10px',
                background: `${color}14`,
                border: `1px solid ${color}30`,
                borderRadius: 20,
                fontSize: '0.7rem',
                color: color,
                fontWeight: 600,
                letterSpacing: '0.05em',
                fontFamily: 'Syne, sans-serif',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* TOC */}
        <TopicTOC sections={topic.sections} color={color} />

        {/* Content */}
        <TopicContent topic={topic} color={color} />

        {/* Prev / Next */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '64px',
          paddingTop: '32px',
          borderTop: '1px solid #2A2A30',
        }}>
          {prevTopic ? (
            <Link href={`/topic/${prevTopic.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#18181C',
                border: '1px solid #2A2A30',
                borderRadius: '10px',
                padding: '16px',
              }}>
                <div style={{ fontSize: '0.72rem', color: '#6B6B7A', marginBottom: '6px', fontFamily: 'Syne, sans-serif' }}>← Previous</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8E8EE', fontFamily: 'Syne, sans-serif' }}>{prevTopic.title}</div>
              </div>
            </Link>
          ) : <div />}

          {nextTopic ? (
            <Link href={`/topic/${nextTopic.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#18181C',
                border: '1px solid #2A2A30',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'right',
              }}>
                <div style={{ fontSize: '0.72rem', color: '#6B6B7A', marginBottom: '6px', fontFamily: 'Syne, sans-serif' }}>Next →</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8E8EE', fontFamily: 'Syne, sans-serif' }}>{nextTopic.title}</div>
              </div>
            </Link>
          ) : <div />}
        </div>
      </main>
    </div>
  )
}

function TopicTOC({ sections, color }: { sections: TopicSections, color: string }) {
  const steps = [
    { key: 'problem', label: '1. Problem' },
    { key: 'need', label: '2. Need' },
    { key: 'analogy', label: '3. Analogy' },
    { key: 'solution', label: '4. Solution' },
    { key: 'keyTerms', label: '5. Key Terms' },
    { key: 'howItWorks', label: '6. How It Works' },
    { key: 'code', label: '7. Code' },
    { key: 'tradeoffs', label: '8. Tradeoffs' },
    { key: 'gcpMapping', label: '9. GCP Mapping' },
    { key: 'diagram', label: '10. Diagram' },
    { key: 'checkQuestion', label: '11. Check' },
  ]

  const present = steps.filter(s => (sections as Record<string, unknown>)[s.key])

  if (present.length === 0) return null

  return (
    <div style={{
      background: '#18181C',
      border: '1px solid #2A2A30',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '40px',
    }}>
      <div style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#6B6B7A',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: 'Syne, sans-serif',
        marginBottom: '14px',
      }}>
        Contents
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {present.map(step => (
          <a key={step.key} href={`#${step.key}`} style={{
            padding: '4px 12px',
            background: `${color}10`,
            border: `1px solid ${color}25`,
            borderRadius: 20,
            fontSize: '0.75rem',
            color: color,
            textDecoration: 'none',
            fontWeight: 600,
            fontFamily: 'Syne, sans-serif',
            transition: 'all 0.15s',
          }}>
            {step.label}
          </a>
        ))}
      </div>
    </div>
  )
}
