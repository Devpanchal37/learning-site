'use client'

import Link from 'next/link'
import type { TopicMeta } from '@/lib/topics'

const STAGE_COLORS: Record<number, string> = {
  1: '#5B6AF0', 2: '#10B981', 3: '#F59E0B', 4: '#EF4444',
  5: '#8B5CF6', 6: '#EC4899', 7: '#14B8A6', 8: '#F97316',
}

export default function TopicCard({ topic }: { topic: TopicMeta }) {
  const color = STAGE_COLORS[topic.stage] || '#5B6AF0'

  return (
    <Link href={`/topic/${topic.slug}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#18181C',
          border: '1px solid #2A2A30',
          borderRadius: '12px',
          padding: '20px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = color + '66'
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = '#2A2A30'
          el.style.transform = 'translateY(0)'
        }}
      >
        {/* Accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }} />

        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: '1rem', color: '#E8E8EE',
          marginBottom: '8px', lineHeight: 1.3,
        }}>
          {topic.title}
        </div>

        {topic.summary && (
          <div style={{
            fontSize: '0.82rem', color: '#9898A8', lineHeight: 1.5,
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {topic.summary}
          </div>
        )}

        {topic.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {topic.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                padding: '2px 8px',
                background: `${color}14`,
                border: `1px solid ${color}30`,
                borderRadius: 20,
                fontSize: '0.68rem', color: color,
                fontWeight: 600, letterSpacing: '0.05em',
                fontFamily: 'Syne, sans-serif',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: '#6B6B7A' }}>
            {topic.date
              ? new Date(topic.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : ''}
          </div>
          <div style={{ fontSize: '0.75rem', color, fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>
            Read →
          </div>
        </div>
      </div>
    </Link>
  )
}
