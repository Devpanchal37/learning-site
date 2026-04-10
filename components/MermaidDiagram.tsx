'use client'

import { useEffect, useRef } from 'react'

interface MermaidProps {
  chart: string
}

export default function MermaidDiagram({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderMermaid = async () => {
      const mermaid = (await import('mermaid')).default
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#1E1E28',
          primaryTextColor: '#E8E8EE',
          primaryBorderColor: '#5B6AF0',
          lineColor: '#5B6AF0',
          secondaryColor: '#18181C',
          tertiaryColor: '#13131A',
          background: '#18181C',
          mainBkg: '#1E1E28',
          nodeBorder: '#5B6AF0',
          clusterBkg: '#18181C',
          titleColor: '#E8E8EE',
          edgeLabelBackground: '#18181C',
          attributeBackgroundColorEven: '#18181C',
          attributeBackgroundColorOdd: '#1E1E28',
        },
        flowchart: { htmlLabels: true, curve: 'basis' },
        sequence: { mirrorActors: false },
      })

      if (ref.current) {
        try {
          const id = `mermaid-${Math.random().toString(36).slice(2)}`
          const { svg } = await mermaid.render(id, chart.trim())
          ref.current.innerHTML = svg
        } catch (e) {
          if (ref.current) {
            ref.current.innerHTML = `<pre style="color:#EF4444;font-size:0.8rem;padding:12px">${String(e)}</pre>`
          }
        }
      }
    }
    renderMermaid()
  }, [chart])

  return (
    <div ref={ref} style={{
      background: '#18181C',
      border: '1px solid #2A2A30',
      borderRadius: '12px',
      padding: '28px',
      margin: '24px 0',
      textAlign: 'center',
      overflowX: 'auto',
      minHeight: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{ color: '#6B6B7A', fontSize: '0.8rem' }}>Rendering diagram…</span>
    </div>
  )
}
