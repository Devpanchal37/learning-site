import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const { slug, content } = await req.json()

    if (!slug || !content) {
      return NextResponse.json({ error: 'slug and content required' }, { status: 400 })
    }

    // Validate slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 })
    }

    // Basic validation: must have frontmatter
    if (!content.startsWith('---')) {
      return NextResponse.json({ error: 'File must start with YAML frontmatter (---). Use the template.' }, { status: 400 })
    }

    const topicsDir = path.join(process.cwd(), 'content/topics')
    if (!fs.existsSync(topicsDir)) {
      fs.mkdirSync(topicsDir, { recursive: true })
    }

    const filePath = path.join(topicsDir, `${slug}.md`)
    fs.writeFileSync(filePath, content, 'utf-8')

    return NextResponse.json({ success: true, slug })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
