import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Tooltip } from '@jetbrains/int-ui-kit'
import { IconCopy } from './uiIcons'

/**
 * Default expanded height adapts to the tool-window viewport: taller window → more code
 * shown before clipping, clamped so it never collapses on short screens nor swallows the feed.
 */
const AIA_CMD_EXPANDED_MIN_H_PX = 320
const AIA_CMD_EXPANDED_MAX_H_PX = 760
const AIA_CMD_EXPANDED_VIEWPORT_RATIO = 0.62

function resolveExpandedMaxHeight(shellEl: HTMLElement): number {
  const scrollEl = shellEl.closest('.figma-ai-tw__scroll') as HTMLElement | null
  const available = scrollEl?.clientHeight || window.innerHeight || AIA_CMD_EXPANDED_MAX_H_PX
  const target = available * AIA_CMD_EXPANDED_VIEWPORT_RATIO
  return Math.round(Math.min(AIA_CMD_EXPANDED_MAX_H_PX, Math.max(AIA_CMD_EXPANDED_MIN_H_PX, target)))
}

/** Expanded default AIA command row: editor-style command + monochrome log viewport. */
export function AiaCmdExpandedLogPanel({
  id,
  command,
  commandCopyText,
  lines,
  ariaLabel,
  feedback,
}: {
  id: string
  command: ReactNode
  commandCopyText: string
  lines: readonly string[]
  ariaLabel: string
  /** Optional block below log lines (e.g. rejection follow-up prompt). */
  feedback?: ReactNode
}) {
  const shellRef = useRef<HTMLDivElement>(null)
  const cmdRef = useRef<HTMLDivElement>(null)
  const logsRef = useRef<HTMLDivElement>(null)
  const scrollAnchorRef = useRef<{ shellTop: number } | null>(null)
  const [cmdCopied, setCmdCopied] = useState(false)
  const [logsCopied, setLogsCopied] = useState(false)
  const [isClipped, setIsClipped] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const logCopyText = useMemo(() => lines.join('\n'), [lines])
  const showExpandControl = isClipped || fullscreen

  const syncLayout = useCallback(() => {
    const shellEl = shellRef.current
    const cmdEl = cmdRef.current
    const logsEl = logsRef.current
    if (!shellEl || !cmdEl || !logsEl) return

    shellEl.style.maxHeight = ''
    shellEl.style.height = ''
    shellEl.style.overflowY = ''
    logsEl.style.maxHeight = ''
    logsEl.style.overflowY = 'visible'

    if (fullscreen) {
      // No internal scroll: the panel grows to full content height; the feed scrolls instead.
      setIsClipped(false)
      return
    }

    const maxH = resolveExpandedMaxHeight(shellEl)
    const cmdH = cmdEl.offsetHeight
    const logsNatural = logsEl.scrollHeight
    const totalNatural = cmdH + logsNatural
    const needsClip = totalNatural > maxH

    if (needsClip) {
      logsEl.style.maxHeight = `${Math.max(32, maxH - cmdH)}px`
      logsEl.style.overflowY = 'hidden'
      shellEl.style.maxHeight = `${maxH}px`
      shellEl.style.overflowY = 'hidden'
      setIsClipped(true)
    } else {
      setIsClipped(false)
    }
  }, [fullscreen])

  /**
   * Toggle fullscreen while keeping the block's top pinned in the viewport, so the extra
   * code reveals/hides only from the bottom instead of shoving the surrounding feed up/down.
   */
  const toggleFullscreen = useCallback(() => {
    const shellEl = shellRef.current
    const scrollEl = shellEl?.closest('.figma-ai-tw__scroll') as HTMLElement | null
    if (shellEl && scrollEl) {
      scrollAnchorRef.current = {
        shellTop:
          shellEl.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top,
      }
    }
    setFullscreen((v) => !v)
  }, [])

  useLayoutEffect(() => {
    syncLayout()
    const shellEl = shellRef.current
    const logsEl = logsRef.current
    if (!shellEl || !logsEl) return
    const ro = new ResizeObserver(() => syncLayout())
    ro.observe(shellEl)
    ro.observe(logsEl)
    if (cmdRef.current) ro.observe(cmdRef.current)
    const scrollEl = shellEl.closest('.figma-ai-tw__scroll')
    if (scrollEl) ro.observe(scrollEl)
    const onResize = () => syncLayout()
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [lines, command, feedback, syncLayout])

  // Runs after syncLayout applied the new heights: restore scroll so the block top stays pinned.
  useLayoutEffect(() => {
    const anchor = scrollAnchorRef.current
    if (!anchor) return
    scrollAnchorRef.current = null
    const shellEl = shellRef.current
    const scrollEl = shellEl?.closest('.figma-ai-tw__scroll') as HTMLElement | null
    if (!shellEl || !scrollEl) return
    const newShellTop =
      shellEl.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top
    scrollEl.scrollTop += newShellTop - anchor.shellTop
  }, [fullscreen])

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(commandCopyText)
      setCmdCopied(true)
      window.setTimeout(() => setCmdCopied(false), 1400)
    } catch {
      /* prototype — ignore */
    }
  }, [commandCopyText])

  const copyLogs = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(logCopyText)
      setLogsCopied(true)
      window.setTimeout(() => setLogsCopied(false), 1400)
    } catch {
      /* prototype — ignore */
    }
  }, [logCopyText])

  return (
    <div
      className={[
        'figma-ai-tw__aiaCmdExpandedPanel',
        fullscreen ? 'figma-ai-tw__aiaCmdExpandedPanel--fullscreen' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        ref={shellRef}
        className={[
          'figma-ai-tw__aiaCmdExpandedPanel__shell',
          isClipped ? 'figma-ai-tw__aiaCmdExpandedPanel__shell--clipped' : '',
          feedback ? 'figma-ai-tw__aiaCmdExpandedPanel__shell--rejectionFeedback' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div ref={cmdRef} className="figma-ai-tw__aiaCmdExpandedCmd">
          <pre className="figma-ai-tw__aiaCmdExpandedCmdPre">{command}</pre>
          <Tooltip text="Copy command" placement="top" delay={300}>
            <button
              type="button"
              className="figma-ai-tw__aiaCmdExpandedCopyBtn"
              aria-label={cmdCopied ? 'Copied' : 'Copy command'}
              onClick={() => void copyCommand()}
            >
              <IconCopy />
            </button>
          </Tooltip>
        </div>
        <div
          className={[
            'figma-ai-tw__aiaCmdExpandedLogsWrap',
            isClipped ? 'figma-ai-tw__aiaCmdExpandedLogsWrap--clipped' : '',
            fullscreen ? 'figma-ai-tw__aiaCmdExpandedLogsWrap--fullscreen' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            id={id}
            ref={logsRef}
            className="figma-ai-tw__aiaCmdExpandedLogs"
            role="log"
            aria-live="polite"
            aria-label={ariaLabel}
          >
            {lines.map((line, i) => (
              <div key={`log-line-${i}`} className="figma-ai-tw__aiaCmdExpandedLogsLine">
                {line || '\u00a0'}
              </div>
            ))}
            {feedback ? (
              <div className="figma-ai-tw__aiaCmdExpandedLogsFeedback">{feedback}</div>
            ) : null}
          </div>
          <Tooltip text="Copy logs" placement="top" delay={300}>
            <button
              type="button"
              className="figma-ai-tw__aiaCmdExpandedCopyBtn figma-ai-tw__aiaCmdExpandedCopyBtn--logs"
              aria-label={logsCopied ? 'Copied' : 'Copy logs'}
              onClick={() => void copyLogs()}
            >
              <IconCopy />
            </button>
          </Tooltip>
          {showExpandControl ? (
            <button
              type="button"
              className="figma-ai-tw__aiaCmdExpandedExpandBtn"
              aria-label={fullscreen ? 'Hide all command output' : 'Show all command output'}
              onClick={toggleFullscreen}
            >
              {fullscreen ? 'Hide all' : 'Show all'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
