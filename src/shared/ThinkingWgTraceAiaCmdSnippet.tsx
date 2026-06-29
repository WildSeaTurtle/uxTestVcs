import { useCallback, useState, type MouseEvent as ReactMouseEvent } from 'react'
import type { ReactNode } from 'react'
import IconMcp from '@icons/Snippet/Snippet Header/Snippet/mcp.svg?react'
import { AiaCmdExpandReveal } from './AiaCmdExpandReveal'
import { AiaCmdLogTail } from './AiaCmdLogTail'
import { AiaDefaultSnippetActions } from './AiaDefaultSnippetActions'
import { AiaExpandableCmdSnippetLeft } from './AiaExpandableCmdSnippetLeft'
import { AiaSnippetCmdLine } from './AiaRichTooltip'
import {
  AIA_CMD_HIGHLIGHT_SED,
  AIA_DEFAULT_FIRST_CMD_MONO,
  AIA_FIRST_CMD_LOG_LINES,
} from './AiaTerminalDemoConstants'
import { ideIcons } from './ideIcons'
import { IconTerminal } from './uiIcons'

export type ThinkingWgTraceToolcallRow =
  | { kind: 'shell'; ok: boolean; label: string }
  | { kind: 'mcp'; ok: boolean; tool: string; args: string }

function traceRowMono(row: ThinkingWgTraceToolcallRow): string {
  return row.kind === 'mcp' ? `${row.tool} ${row.args}` : row.label.replace(/^\$\s*/, '')
}

function genericShellLogLines(mono: string): readonly string[] {
  return [`$ ${mono}`, 'Process finished with exit code 0']
}

function genericFailedLogLines(mono: string): readonly string[] {
  return [`$ ${mono}`, 'Process finished with exit code 1']
}

/**
 * Default AIA terminal row inside Working Group CP trace — same chrome as compact terminal
 * commands (expand hit, hover actions, full log on expand). No compact 3-line stream while
 * in progress (WG context only shows the shimmering command line until settled).
 */
export function ThinkingWgTraceAiaCmdSnippet({
  row,
  running = false,
  stepIndex,
  allowLogExpand = true,
}: {
  row: ThinkingWgTraceToolcallRow
  running?: boolean
  stepIndex: number
  /** When false (WG CP peek), row clicks bubble to expand the whole section — no per-command log. */
  allowLogExpand?: boolean
}) {
  const ok = row.ok
  const mono = traceRowMono(row)
  const isMcp = row.kind === 'mcp'
  const isSed = !isMcp && mono === AIA_DEFAULT_FIRST_CMD_MONO
  const isFailed = !running && !ok

  const expandLogId = `fa-wg-trace-cmd-${stepIndex}`

  const [logExpanded, setLogExpanded] = useState(false)

  const toggleLog = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (running || !allowLogExpand) return
      event.stopPropagation()
      setLogExpanded((open) => !open)
    },
    [running, allowLogExpand],
  )

  const logLines = isSed
    ? AIA_FIRST_CMD_LOG_LINES
    : isFailed
      ? genericFailedLogLines(mono)
      : genericShellLogLines(mono)

  const logHighlight: ReactNode | undefined = isSed
    ? AIA_CMD_HIGHLIGHT_SED
    : isMcp
      ? undefined
      : <span className="m">{mono}</span>

  const logAriaLabel = isSed
    ? 'sed command output'
    : isMcp
      ? `${row.tool} output`
      : isFailed
        ? 'failed command output'
        : 'command output'

  const snippetClass = [
    'figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd',
    isMcp ? 'figma-ai-tw__snippet--aiaCmdMcp' : '',
    running ? 'figma-ai-tw__snippet--aiaCmdInProgress' : '',
    !running && ok ? 'figma-ai-tw__snippet--aiaCmdCompleted' : '',
    isFailed ? 'figma-ai-tw__snippet--aiaCmdFailed' : '',
    logExpanded && !running ? 'figma-ai-tw__snippet--aiaCmdLogExpanded' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const cmdLineClass = [
    'figma-ai-tw__snippetCmd',
    isMcp ? 'figma-ai-tw__snippetCmd--aiaMcpLine' : 'figma-ai-tw__snippetCmd--aiaFirstRowCmdEllipsis',
    running ? 'figma-ai-tw__snippetCmd--aiaLoading' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const leftInner = (
    <>
      {running ? (
        <span className="figma-ai-tw__snippetIcon">
          <IconTerminal />
        </span>
      ) : isMcp ? (
        <span className="figma-ai-tw__snippetIcon figma-ai-tw__snippetIcon--aiaMcpPlugin">
          <IconMcp className="figma-ai-tw__aiaMcpIconSvg" aria-hidden />
        </span>
      ) : isFailed ? (
        <span className="figma-ai-tw__snippetIcon">
          <img
            className="figma-ai-tw__aiaCmdStatusIcon"
            src={ideIcons.aiMessageCross}
            alt=""
            width={16}
            height={16}
          />
        </span>
      ) : (
        <span className="figma-ai-tw__snippetIcon">
          <IconTerminal />
        </span>
      )}
      <AiaSnippetCmdLine
        className={cmdLineClass}
        mono={mono}
        highlight={isSed && !running ? AIA_CMD_HIGHLIGHT_SED : undefined}
      >
        {isFailed && !isMcp ? (
          <>
            <span className="figma-ai-tw__aiaCmdStatusLabel figma-ai-tw__aiaCmdStatusLabel--failed">Failed</span>
            <span className="figma-ai-tw__aiaCmdStatusCmd">{mono}</span>
          </>
        ) : isMcp ? (
          <>
            <span className="figma-ai-tw__aiaMcpToolName">{row.tool}</span>
            <span className="figma-ai-tw__aiaMcpArgsInline">{row.args}</span>
          </>
        ) : isSed ? (
          <span className="m">{AIA_DEFAULT_FIRST_CMD_MONO}</span>
        ) : null}
      </AiaSnippetCmdLine>
    </>
  )

  return (
    <div className="figma-ai-tw__aiaDefaultSnippets figma-ai-tw__aiaDefaultSnippets--thinkingWgCpTrace" role="listitem">
      <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
        <div className={snippetClass} aria-busy={running ? true : undefined}>
          <div className="figma-ai-tw__snippetHeader">
            <AiaExpandableCmdSnippetLeft
              className={isMcp ? 'figma-ai-tw__snippetLeft--aiaMcp' : ''}
              onExpandToggle={running || !allowLogExpand ? undefined : toggleLog}
              logExpanded={allowLogExpand && logExpanded}
              expandLogId={expandLogId}
            >
              {leftInner}
            </AiaExpandableCmdSnippetLeft>
            <div className="figma-ai-tw__snippetRight">
              <AiaDefaultSnippetActions
                completed={!running}
                inProgress={running}
                logExpanded={allowLogExpand && logExpanded}
                onExpandToggle={running || !allowLogExpand ? undefined : toggleLog}
                expandLogId={expandLogId}
              />
            </div>
          </div>

          <AiaCmdExpandReveal open={allowLogExpand && logExpanded && !running}>
            {allowLogExpand && logExpanded && !running ? (
              <AiaCmdLogTail
                id={expandLogId}
                lines={logLines}
                expanded
                ariaLabel={logAriaLabel}
                command={logHighlight}
                commandCopyText={mono}
              />
            ) : null}
          </AiaCmdExpandReveal>

          <div className="figma-ai-tw__snippetOutline" aria-hidden />
        </div>
      </div>
    </div>
  )
}
