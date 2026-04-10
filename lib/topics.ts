import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const TOPICS_DIR = path.join(process.cwd(), 'content/topics')

export interface TopicMeta {
  slug: string
  title: string
  stage: number
  stageLabel: string
  date: string
  summary: string
  tags: string[]
  gcpServices: string[]
}

export interface Topic extends TopicMeta {
  content: string
  sections: TopicSections
}

export interface TopicSections {
  problem?: string
  need?: string
  analogy?: string
  solution?: string
  keyTerms?: string
  howItWorks?: string
  code?: string
  tradeoffs?: TradeoffEntry[]
  gcpMapping?: string
  diagram?: string
  checkQuestion?: string
  checkAnswer?: string
}

export interface TradeoffEntry {
  axis: string
  impact: string
  detail: string
}

const STAGE_LABELS: Record<number, string> = {
  1: 'Fundamentals',
  2: 'Building Blocks',
  3: 'Database Deep Dive',
  4: 'Distributed Systems',
  5: 'API Design',
  6: 'Design Patterns',
  7: 'Real-World Systems',
  8: 'Production Concerns',
}

export function getAllTopics(): TopicMeta[] {
  if (!fs.existsSync(TOPICS_DIR)) return []

  const files = fs.readdirSync(TOPICS_DIR).filter(f => f.endsWith('.md'))

  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(TOPICS_DIR, file), 'utf-8')
      const { data } = matter(raw)
      const stage = Number(data.stage) || 1
      return {
        slug: file.replace('.md', ''),
        title: data.title || 'Untitled',
        stage,
        stageLabel: STAGE_LABELS[stage] || `Stage ${stage}`,
        date: data.date || '',
        summary: data.summary || '',
        tags: data.tags || [],
        gcpServices: data.gcpServices || [],
      }
    })
    .sort((a, b) => {
      if (a.stage !== b.stage) return a.stage - b.stage
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
}

export function getTopic(slug: string): Topic | null {
  const filePath = path.join(TOPICS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const stage = Number(data.stage) || 1

  // Parse sections from content using ## headings
  const sections = parseSections(content)

  return {
    slug,
    title: data.title || 'Untitled',
    stage,
    stageLabel: STAGE_LABELS[stage] || `Stage ${stage}`,
    date: data.date || '',
    summary: data.summary || '',
    tags: data.tags || [],
    gcpServices: data.gcpServices || [],
    content,
    sections,
  }
}

function parseSections(content: string): TopicSections {
  const sections: TopicSections = {}

  const sectionMap: Record<string, keyof TopicSections> = {
    'PROBLEM': 'problem',
    'NEED': 'need',
    'ANALOGY': 'analogy',
    'SOLUTION': 'solution',
    'KEY TERMS': 'keyTerms',
    'HOW IT WORKS': 'howItWorks',
    'CODE': 'code',
    'TRADEOFFS': 'tradeoffs',
    'GCP MAPPING': 'gcpMapping',
    'DIAGRAM': 'diagram',
    'CHECK QUESTION': 'checkQuestion',
    'CHECK ANSWER': 'checkAnswer',
  }

  // Split by ## headings
  const parts = content.split(/^## /m)

  for (const part of parts) {
    const lines = part.trim().split('\n')
    const heading = lines[0]?.trim().toUpperCase()
    const body = lines.slice(1).join('\n').trim()

    const key = sectionMap[heading]
    if (!key) continue

    if (key === 'tradeoffs') {
      sections.tradeoffs = parseTradeoffs(body)
    } else {
      (sections as Record<string, string>)[key as string] = body
    }
  }

  return sections
}

function parseTradeoffs(content: string): TradeoffEntry[] {
  const entries: TradeoffEntry[] = []
  const axes = ['Performance', 'Cost', 'Complexity', 'Reliability', 'Scalability']

  for (const axis of axes) {
    const regex = new RegExp(`\\*\\*${axis}\\*\\*[:\\s]+([^\\n]+)(?:\\n([^*]+))?`, 'i')
    const match = content.match(regex)
    if (match) {
      entries.push({
        axis,
        impact: match[1]?.trim() || '',
        detail: match[2]?.trim() || '',
      })
    }
  }

  // Fallback: return raw if parsing fails
  if (entries.length === 0 && content.trim()) {
    return [{ axis: 'Notes', impact: content.trim(), detail: '' }]
  }

  return entries
}

export function getStageGroups(topics: TopicMeta[]): Map<number, TopicMeta[]> {
  const groups = new Map<number, TopicMeta[]>()
  for (const topic of topics) {
    if (!groups.has(topic.stage)) groups.set(topic.stage, [])
    groups.get(topic.stage)!.push(topic)
  }
  return groups
}
