import { useMemo, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { AiaCmdExpandedLogPanel } from './AiaCmdExpandedLogPanel'

/** Compact stream: 1–3 visible lines; when n>3, show last 3 only (viewport stays 3 lines tall). */
function compactStreamVisibleLines(lines: readonly string[]): readonly string[] {
  const n = lines.length
  if (n === 0) return []
  if (n <= 3) return lines
  return lines.slice(-3)
}

/** Shared terminal-style log under default AIA command rows (`npm` stream + any row “Expand”). */
export function AiaCmdLogTail({
  id,
  lines,
  expanded,
  ariaLabel,
  compactStream = false,
  onCompactExpand,
  command,
  commandCopyText,
  feedback,
}: {
  id: string
  lines: readonly string[]
  expanded: boolean
  ariaLabel: string
  compactStream?: boolean
  onCompactExpand?: (event: ReactMouseEvent<HTMLButtonElement>) => void
  command?: ReactNode
  commandCopyText?: string
  feedback?: ReactNode
}) {
  const linesKey = JSON.stringify(lines)
  const visibleLines = useMemo(() => compactStreamVisibleLines(lines), [linesKey])

  if (compactStream && !expanded) {
    if (visibleLines.length === 0) return null

    const lineCount = visibleLines.length as 1 | 2 | 3
    const streamOverflow = lines.length > 3

    const compactTailClass = [
      'figma-ai-tw__aiaNpmInitStreamTail',
      'figma-ai-tw__aiaNpmInitStreamTail--compactStream',
      onCompactExpand ? 'figma-ai-tw__aiaNpmInitStreamTail--compactExpandable' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const compactViewport = (
      <div
        className={[
          'figma-ai-tw__aiaNpmInitStreamTailViewport',
          `figma-ai-tw__aiaNpmInitStreamTailViewport--lines${lineCount}`,
          streamOverflow ? 'figma-ai-tw__aiaNpmInitStreamTailViewport--overflow' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="figma-ai-tw__aiaNpmInitStreamTailStack">
          {visibleLines.map((line, i) => (
            <div
              key={`line-${i}`}
              className="figma-ai-tw__aiaNpmInitStreamTailLine figma-ai-tw__aiaNpmInitStreamTailLine--compact"
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    )

    return (
      <div className="figma-ai-tw__aiaNpmInitStreamTailOuter">
        {onCompactExpand ? (
          <button
            type="button"
            id={id}
            className={compactTailClass}
            onClick={onCompactExpand}
            aria-label={`Expand ${ariaLabel}`}
          >
            {compactViewport}
          </button>
        ) : (
          <div
            id={id}
            className={compactTailClass}
            role="log"
            aria-live="polite"
            aria-label={ariaLabel}
          >
            {compactViewport}
          </div>
        )}
      </div>
    )
  }

  if (expanded && command && commandCopyText) {
    return (
      <AiaCmdExpandedLogPanel
        id={id}
        command={command}
        commandCopyText={commandCopyText}
        lines={lines}
        ariaLabel={ariaLabel}
        feedback={feedback}
      />
    )
  }

  return (
    <div className="figma-ai-tw__aiaNpmInitStreamTailOuter">
      <div
        id={id}
        className={[
          'figma-ai-tw__aiaNpmInitStreamTail',
          expanded ? 'figma-ai-tw__aiaNpmInitStreamTail--expandedLog' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="log"
        aria-live="polite"
        aria-label={ariaLabel}
      >
        {lines.map((line, i) => (
          <div key={`${i}-${line.slice(0, 24)}`} className="figma-ai-tw__aiaNpmInitStreamTailLine">
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
