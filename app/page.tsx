import Link from 'next/link'
import { getAllTopics, getStageGroups } from '@/lib/topics'
import TopicCard from '@/components/TopicCard'

const STAGE_COLORS: Record<number, string> = {
  1: '#5B6AF0', 2: '#10B981', 3: '#F59E0B', 4: '#EF4444',
  5: '#8B5CF6', 6: '#EC4899', 7: '#14B8A6', 8: '#F97316',
}
const STAGE_ICONS: Record<number, string> = {
  1: '◎', 2: '⬡', 3: '◈', 4: '⟁', 5: '◫', 6: '❋', 7: '◉', 8: '⚙',
}

export default function Home() {
  const topics = getAllTopics()
  const stageGroups = getStageGroups(topics)
  const totalTopics = topics.length
  const stagesStarted = stageGroups.size

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0F' }}>
      <nav style={{
        borderBottom: '1px solid #2A2A30', padding: '0 24px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: 'rgba(13,13,15,0.95)',
        backdropFilter: 'blur(12px)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, background: 'linear-gradient(135deg, #5B6AF0, #8B5CF6)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif',
          }}>SD</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#E8E8EE' }}>
            System Design Mastery
          </span>
        </div>
        <Link href="/admin" style={{
          padding: '6px 16px', background: '#18181C', border: '1px solid #2A2A30',
          borderRadius: 8, color: '#9898A8', fontSize: '0.8rem', textDecoration: 'none',
          fontFamily: 'Syne, sans-serif', fontWeight: 600,
        }}>+ Upload Topic</Link>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px',
            background: 'rgba(91,106,240,0.1)', border: '1px solid rgba(91,106,240,0.3)',
            borderRadius: 20, color: '#7B8AF8', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif', marginBottom: '20px',
          }}>Learning Journal</div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800, lineHeight: 1.1, color: '#E8E8EE', marginBottom: '16px', letterSpacing: '-0.03em',
          }}>
            System Design<br /><span style={{ color: '#5B6AF0' }}>from first principles</span>
          </h1>
          <p style={{ color: '#9898A8', fontSize: '1.05rem', maxWidth: '520px', lineHeight: 1.6, marginBottom: '32px' }}>
            A structured journey through distributed systems, databases, APIs, and production architecture.
            Every concept taught with code, diagrams, and trade-offs.
          </p>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { label: 'Topics covered', value: totalTopics },
              { label: 'Stages active', value: `${stagesStarted}/8` },
              { label: 'Framework', value: '11-step' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#E8E8EE', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#6B6B7A', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {totalTopics === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px dashed #2A2A30', borderRadius: '16px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>◎</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#9898A8', marginBottom: '8px' }}>No topics yet</div>
            <div style={{ fontSize: '0.875rem', color: '#6B6B7A', marginBottom: '24px' }}>Complete your first learning session, then upload the markdown file.</div>
            <Link href="/admin" style={{
              display: 'inline-block', padding: '10px 24px', background: '#5B6AF0',
              borderRadius: 8, color: 'white', textDecoration: 'none',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.875rem',
            }}>Upload first topic →</Link>
          </div>
        )}

        {Array.from(stageGroups.entries()).map(([stage, stageTopics]) => {
          const color = STAGE_COLORS[stage] || '#5B6AF0'
          const icon = STAGE_ICONS[stage] || '◎'
          return (
            <div key={stage} style={{ marginBottom: '56px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${color}22`,
              }}>
                <div style={{
                  width: 36, height: 36, background: `${color}18`, border: `1px solid ${color}44`,
                  borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color,
                }}>{icon}</div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#E8E8EE', lineHeight: 1.2 }}>
                    Stage {stage} — {stageTopics[0]?.stageLabel}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B6B7A', marginTop: '2px' }}>
                    {stageTopics.length} topic{stageTopics.length !== 1 ? 's' : ''} covered
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {stageTopics.map(topic => <TopicCard key={topic.slug} topic={topic} />)}
              </div>
            </div>
          )
        })}
      </main>

      <footer style={{
        borderTop: '1px solid #2A2A30', padding: '24px', textAlign: 'center',
        color: '#6B6B7A', fontSize: '0.8rem', fontFamily: 'Syne, sans-serif',
      }}>
        System Design Mastery — built while learning
      </footer>
    </div>
  )
}
