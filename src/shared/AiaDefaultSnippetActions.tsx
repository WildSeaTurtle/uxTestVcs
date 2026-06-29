import type { MouseEvent as ReactMouseEvent } from 'react'
import { ideIcons } from './ideIcons'

function IconImg({ src, alt, title }: { src: string; alt: string; title?: string }) {
  return <img className="figma-ai-tw__iconImg" src={src} alt={alt} title={title} width={16} height={16} />
}

/** Trailing actions for default AIA terminal rows — open only when `completed`; Stop only while `inProgress`. */
export function AiaDefaultSnippetActions({
  completed,
  inProgress = false,
  logExpanded = false,
  onExpandToggle,
  expandLogId = 'fa-aia-cmd-log',
  onOpenInTab,
}: {
  completed: boolean
  inProgress?: boolean
  logExpanded?: boolean
  onExpandToggle?: (event: ReactMouseEvent<HTMLElement>) => void
  /** `id` of the log region when expanded (`aria-controls`). */
  expandLogId?: string
  /** “Open in tool window” — parent opens an editor tab (full shell only). */
  onOpenInTab?: () => void
}) {
  return (
    <>
      <button type="button" className="figma-ai-tw__iconHit" aria-label="More">
        <span className="figma-ai-tw__icon16">
          <IconImg src={ideIcons.commandMore} alt="" />
        </span>
      </button>
      {completed && onOpenInTab ? (
        <button
          type="button"
          className="figma-ai-tw__iconHit"
          aria-label="Open in tool window"
          onClick={onOpenInTab}
        >
          <span className="figma-ai-tw__icon16">
            <IconImg src={ideIcons.commandOpen} alt="" />
          </span>
        </button>
      ) : null}
      <button
        type="button"
        className={[
          'figma-ai-tw__iconHit',
          onExpandToggle ? 'figma-ai-tw__iconHit--aiaLogToggle' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={logExpanded ? 'Collapse command output' : 'Expand command output'}
        aria-expanded={onExpandToggle ? logExpanded : undefined}
        aria-controls={onExpandToggle && logExpanded ? expandLogId : undefined}
        onClick={onExpandToggle}
      >
        <span className="figma-ai-tw__icon16">
          {logExpanded ? (
            <IconImg src={ideIcons.commandCollapse} alt="" />
          ) : (
            <IconImg src={ideIcons.commandExpand} alt="" />
          )}
        </span>
      </button>
      {inProgress ? (
        <button type="button" className="figma-ai-tw__iconHit figma-ai-tw__iconHit--aiaStop" aria-label="Stop">
          <span className="figma-ai-tw__icon16">
            <IconImg src={ideIcons.inputToolbarStop} alt="" />
          </span>
        </button>
      ) : null}
    </>
  )
}
