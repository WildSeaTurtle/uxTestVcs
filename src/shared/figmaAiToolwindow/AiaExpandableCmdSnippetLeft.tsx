import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react'

/** Clickable snippet left — expand/collapse command output (default AIA terminal rows). */
export function AiaExpandableCmdSnippetLeft({
  children,
  onExpandToggle,
  logExpanded = false,
  expandLogId = 'fa-aia-cmd-log',
  className = '',
}: {
  children: ReactNode
  onExpandToggle?: (event: ReactMouseEvent<HTMLElement>) => void
  logExpanded?: boolean
  expandLogId?: string
  className?: string
}) {
  const classes = [
    'figma-ai-tw__snippetLeft',
    onExpandToggle ? 'figma-ai-tw__snippetLeft--aiaCmdExpandHit' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (!onExpandToggle) {
    return <div className={classes}>{children}</div>
  }

  const handleActivate = (event: ReactMouseEvent<HTMLDivElement> | ReactKeyboardEvent<HTMLDivElement>) => {
    if (
      (event.target as HTMLElement).closest(
        'button, a, [role="button"]:not(.figma-ai-tw__snippetLeft--aiaCmdExpandHit)',
      )
    ) {
      return
    }
    onExpandToggle(event as unknown as ReactMouseEvent<HTMLElement>)
  }

  return (
    <div
      className={classes}
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        handleActivate(event)
      }}
      aria-label={logExpanded ? 'Collapse command output' : 'Expand command output'}
      aria-expanded={logExpanded}
      aria-controls={logExpanded ? expandLogId : undefined}
    >
      {children}
    </div>
  )
}
