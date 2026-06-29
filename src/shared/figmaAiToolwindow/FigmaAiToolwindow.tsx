/* eslint-disable react-hooks/set-state-in-effect -- ported demo; effect syncs draft state from DOM */
import './FigmaAiToolwindow.css'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  Dispatch,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
  SetStateAction,
} from 'react'
import { Button, Icon } from '@jetbrains/int-ui-kit'
import IconMcp from '@icons/Snippet/Snippet Header/Snippet/mcp.svg?react'
import { ideIcons } from './ideIcons'
import {
  IconArrowDownShortcut,
  IconArrowUpShortcut,
  IconBanSmall,
  IconChevronDown,
  IconTerminal,
} from './uiIcons'
import { AiaCmdExpandedLogPanel } from './AiaCmdExpandedLogPanel'
import { AiaHoverRichTip, AiaSnippetCmdLine } from './AiaRichTooltip'
import { AiaDefaultSnippetActions } from './AiaDefaultSnippetActions'
import {
  AIA_CMD_HIGHLIGHT_SED,
  AIA_DEFAULT_FIRST_CMD_MONO,
  AIA_FIRST_CMD_LOG_LINES,
  AIA_FIRST_ROW_WAIT_STREAM_LINES,
} from './AiaTerminalDemoConstants'
export {
  AIA_CMD_HIGHLIGHT_SED,
  AIA_DEFAULT_FIRST_CMD_MONO,
  AIA_FIRST_CMD_LOG_LINES,
} from './AiaTerminalDemoConstants'
export { AiaDefaultSnippetActions } from './AiaDefaultSnippetActions'
import { AiaExpandableCmdSnippetLeft } from './AiaExpandableCmdSnippetLeft'
export { AiaExpandableCmdSnippetLeft } from './AiaExpandableCmdSnippetLeft'
import { AIA_CMD_EXPAND_REVEAL_MS, AiaCmdExpandReveal } from './AiaCmdExpandReveal'
export { AIA_CMD_EXPAND_REVEAL_MS, AiaCmdExpandReveal } from './AiaCmdExpandReveal'
import { AiaCmdLogTail } from './AiaCmdLogTail'
export { AiaCmdLogTail } from './AiaCmdLogTail'
import {
  AIA_FEED_SCROLL_PIN_GRACE_MS,
  anchorFeedGrowthDown,
  AiaToolwindowFeedScrollProvider,
} from './AiaToolwindowFeedScroll'
import {
  ThinkingWgToolcallsPanel,
  type ThinkingWgDemoControl,
  type ThinkingWgMixedCpTraceStyle,
  type ThinkingWgMixedExpandRailVariant,
  type ThinkingWgPanelKind,
  type ThinkingWgToolcallsMode,
} from './ThinkingWgToolcallsPanel'

function IconImg({ src, alt, title }: { src: string; alt: string; title?: string }) {
  return <img className="figma-ai-tw__iconImg" src={src} alt={alt} title={title} width={16} height={16} />
}

const APPROVAL_OPTION_IDS = ['fa-approval-0', 'fa-approval-1', 'fa-approval-2'] as const
const APPROVAL_SHORTCUTS = ['⌥1', '⌥2', '⌥3'] as const
const APPROVAL_LAST_INDEX = APPROVAL_OPTION_IDS.length - 1

const MCP_APPROVAL_OPTION_IDS = ['fa-mcp-approval-0', 'fa-mcp-approval-1', 'fa-mcp-approval-2'] as const
const MCP_APPROVAL_LAST_INDEX = MCP_APPROVAL_OPTION_IDS.length - 1

/** After picking an approval option: “In progress” shimmer phase before the row settles to done (~5.6s). */
const APPROVAL_IN_PROGRESS_MS = 5600

/** Scripted `npm init -y` terminal log (non-interactive; matches `npm init -y` row). */
export const APPROVAL_NPM_INIT_STREAM_LINES = [
  'npm verbose cli /usr/local/bin/node /usr/local/bin/npm',
  'npm info using npm@10.8.2',
  'Wrote to ./package.json:',
  '{',
  '  "name": "int-ui-prototypes",',
  '  "version": "1.0.0",',
  '  "private": true',
  '}',
  'npm info ok',
] as const

const APPROVAL_CHOICE_LABELS = [
  'Yes',
  'Yes, allow all edits during this session',
  'No, and tell Claude what to do differently',
] as const

/** Short narrative between default-variant command rows (ungrouped agent cadence). */
export const AIA_CMD_BRIDGE_AFTER_SED =
  'The team page slice looks intact — I’ll scaffold a minimal package.json next so we can iterate on logging without touching the dashboard route yet.'

export const AIA_CMD_BRIDGE_AFTER_NPM_INIT =
  'package.json is in place; pulling dependencies next with audit and funding noise turned off.'

export const AIA_CMD_BRIDGE_AFTER_NPM_INSTALL =
  'Install finished cleanly — running a production-only audit pass before we read local notes.'

export const AIA_CMD_BRIDGE_AFTER_NPM_AUDIT =
  'No production vulnerabilities reported — I’ll pull the slice from `.ai/local.md` through the IDE proxy.'

export const AIA_MCP_READ_FILE_TOOL = 'ijproxy.read_file'
export const AIA_MCP_READ_FILE_ARGS_PREVIEW =
  '{"file_path": ".ai/local.md", "mode": "slice", "start_line": 1, "max_lines": 200}'

/** Composer-docked permission (permissions-in-input): natural-language ask + bare command line. */
export const AIA_COMPOSER_NPM_INIT_PERMISSION_PROMPT =
  'Allow running npm init -y in the current repository to create a default package.json?'

const AIA_COMPOSER_NPM_INIT_CMD_MONO =
  'npm init -y --init-version=1.0.0 --scope=@jetbrains/aia-design --license=MIT --description="Int UI prototypes"'

const AIA_CMD_HIGHLIGHT_COMPOSER_NPM_INIT = (
  <>
    <span className="m o">npm </span>
    <span className="m p">init </span>
    <span className="m p">-y </span>
    <span className="m c">--init-version=1.0.0 </span>
    <span className="m c">--scope=@jetbrains/aia-design </span>
    <span className="m c">--license=MIT </span>
    <span className="m c">--description=&quot;Int UI prototypes&quot;</span>
  </>
)

export const AIA_COMPOSER_MCP_READ_FILE_PERMISSION_PROMPT =
  'Allow reading lines 1–200 from `.ai/local.md` via the IDE proxy (ijproxy.read_file)?'

export const AIA_CMD_HIGHLIGHT_NPM_INIT = (
  <>
    <span className="m o">npm</span>
    <span className="m"> </span>
    <span className="m p">init</span>
    <span className="m"> </span>
    <span className="m p">-y</span>
  </>
)
const AIA_CMD_COPY_NPM_INIT = 'npm init -y'

export const AIA_CMD_HIGHLIGHT_NPM_INSTALL = (
  <>
    <span className="m o">npm</span>
    <span className="m"> </span>
    <span className="m p">install</span>
    <span className="m"> </span>
    <span className="m p">--no-audit</span>
    <span className="m"> </span>
    <span className="m p">--no-fund</span>
  </>
)
const AIA_CMD_COPY_NPM_INSTALL = 'npm install --no-audit --no-fund'

export const AIA_CMD_HIGHLIGHT_NPM_AUDIT = (
  <>
    <span className="m o">npm</span>
    <span className="m"> </span>
    <span className="m p">audit</span>
    <span className="m"> </span>
    <span className="m p">--omit=dev</span>
  </>
)
const AIA_CMD_COPY_NPM_AUDIT = 'npm audit --omit=dev'

export const AIA_CMD_HIGHLIGHT_MCP = (
  <>
    <span className="figma-ai-tw__aiaMcpToolName figma-ai-tw__aiaCmdExpandedMcpTool">{AIA_MCP_READ_FILE_TOOL}</span>
    <span className="m"> </span>
    <AiaMcpReadFileArgsHighlighted layout="inline" />
  </>
)
const AIA_CMD_COPY_MCP = `${AIA_MCP_READ_FILE_TOOL} ${AIA_MCP_READ_FILE_ARGS_PREVIEW}`

const AIA_MCP_READ_FILE_LINE_IN_PROGRESS = `${AIA_MCP_READ_FILE_TOOL} ${AIA_MCP_READ_FILE_ARGS_PREVIEW}`

/** Progressive MCP log (compact stream + expanded in-flight tail). */
const AIA_MCP_CMD_STREAM_SCRIPT = [
  '[ijproxy] read_file .ai/local.md slice lines=1-200',
  'POST /mcp/tools/call HTTP/1.1 200 OK 18ms',
  '200 lines (18432 bytes)',
] as const

/** Alias: expanded MCP “in flight” log uses the same script as the compact stream. */
const AIA_MCP_CMD_LOG_IN_PROGRESS_LINES = AIA_MCP_CMD_STREAM_SCRIPT

const AIA_MCP_CMD_LOG_PENDING_LINES = [
  '[ijproxy] read_file queued — awaiting approval',
  'target: .ai/local.md lines 1-200',
] as const

export const AIA_MCP_CMD_LOG_LINES = [
  '[ijproxy] read_file .ai/local.md slice lines=1-200',
  'POST /mcp/tools/call HTTP/1.1 200 OK 24ms',
  '200 lines (18432 bytes)',
] as const

/** Chained terminal rows after `npm init -y` succeeds — linear narrative (dwell → run → gap → run). */
const AIA_LINEAR_DWELL_AFTER_NPM_MS = 520
/** Chained `npm install`: in-progress shimmer duration (shorter — finishes first). */
const AIA_NPM_FOLLOW_INSTALL_RUN_MS = 2200
/** Chained `npm audit`: in-progress shimmer duration (longer — reads as heavier scan). */
const AIA_NPM_FOLLOW_AUDIT_RUN_MS = 5200
const AIA_NPM_FOLLOW_GAP_MS = 360
/** After last chained npm reaches done: pause before MCP row mounts (no overlap with follow rows). */
const AIA_LINEAR_DWELL_BEFORE_MCP_MS = 400

export const AIA_NPM_FOLLOW_INSTALL_LOG_LINES = [
  'npm verbose cli /usr/local/bin/node /usr/local/bin/npm',
  'npm info using npm@10.8.2',
  'npm verbose title npm install --no-audit --no-fund',
  'npm http fetch GET 200 https://registry.npmjs.org/typescript 118ms (cache revalidated)',
  'npm http fetch GET 200 https://registry.npmjs.org/prettier/-/prettier-3.3.3.tgz 402ms',
  'npm http fetch GET 200 https://registry.npmjs.org/eslint/-/eslint-9.12.0.tgz 610ms',
  'added 218 packages in 12s',
] as const

export const AIA_NPM_FOLLOW_AUDIT_LOG_LINES = [
  'npm verbose cli /usr/local/bin/node /usr/local/bin/npm',
  'npm info using npm@10.8.2',
  'npm verbose title npm audit --omit=dev',
  'npm http fetch POST 200 https://registry.npmjs.org/-/npm/v1/security/audits/quick 186ms',
  'computing audit tree from ./package-lock.json (lockfileVersion=3)',
  'analyzed 218 packages in 2.4s',
  'omit=dev — skipping devDependency subgraph (eslint, vitest, @types/*)',
  '# npm audit report',
  'using production dependency graph only',
  'found 0 vulnerabilities',
] as const

const AIA_NPM_FOLLOW_INSTALL_LOG_RUNNING = [
  'npm verbose reify loadVirtual — root project',
  'npm http fetch GET 200 https://registry.npmjs.org/typescript/-/typescript-5.6.3.tgz 624ms',
  '⠋ reify: timing idealTree:init Completed in 14ms',
  '⠙ reify: timing idealTree:userRequests Completed in 3ms',
] as const

const AIA_NPM_FOLLOW_AUDIT_LOG_RUNNING = [
  'npm verbose audit loading virtual tree from lockfile',
  '⠋ audit: building flat production graph (omit=dev)',
  'npm http fetch POST 200 https://registry.npmjs.org/-/npm/v1/security/audits/quick … 120ms',
  '⠹ audit: computing severity metadata for 218 packages',
] as const

/** Full scripted stream for compact tail while each follow row runs (tick interval derived from row duration). */
const AIA_NPM_FOLLOW_INSTALL_STREAM_SCRIPT = [
  ...AIA_NPM_FOLLOW_INSTALL_LOG_RUNNING,
  ...AIA_NPM_FOLLOW_INSTALL_LOG_LINES,
] as const

const AIA_NPM_FOLLOW_AUDIT_STREAM_SCRIPT = [
  ...AIA_NPM_FOLLOW_AUDIT_LOG_RUNNING,
  ...AIA_NPM_FOLLOW_AUDIT_LOG_LINES,
] as const

function AiaMcpReadFileArgsHighlighted({ layout }: { layout: 'inline' | 'multiline' }) {
  const json = (
    <>
      <span className="figma-ai-tw__aiaMcpJsonPunc">{'{'}</span>
      <span className="figma-ai-tw__aiaMcpJsonKey">&quot;file_path&quot;</span>
      <span className="figma-ai-tw__aiaMcpJsonPunc">: </span>
      <span className="figma-ai-tw__aiaMcpJsonStr">&quot;.ai/local.md&quot;</span>
      <span className="figma-ai-tw__aiaMcpJsonPunc">, </span>
      <span className="figma-ai-tw__aiaMcpJsonKey">&quot;mode&quot;</span>
      <span className="figma-ai-tw__aiaMcpJsonPunc">: </span>
      <span className="figma-ai-tw__aiaMcpJsonStr">&quot;slice&quot;</span>
      <span className="figma-ai-tw__aiaMcpJsonPunc">, </span>
      <span className="figma-ai-tw__aiaMcpJsonKey">&quot;start_line&quot;</span>
      <span className="figma-ai-tw__aiaMcpJsonPunc">: </span>
      <span className="figma-ai-tw__aiaMcpJsonNum">1</span>
      <span className="figma-ai-tw__aiaMcpJsonPunc">, </span>
      <span className="figma-ai-tw__aiaMcpJsonKey">&quot;max_lines&quot;</span>
      <span className="figma-ai-tw__aiaMcpJsonPunc">: </span>
      <span className="figma-ai-tw__aiaMcpJsonNum">200</span>
      <span className="figma-ai-tw__aiaMcpJsonPunc">{'}'}</span>
    </>
  )

  if (layout === 'inline') {
    return <span className="figma-ai-tw__aiaCmdExpandedMcpArgs">{json}</span>
  }

  return (
    <div className="figma-ai-tw__aiaMcpJsonTooltipInner">
      <p className="figma-ai-tw__aiaMcpJsonTooltipPara">
        <span className="figma-ai-tw__aiaMcpJsonLine">
          <span className="figma-ai-tw__aiaMcpJsonPunc">{'{'}</span>
        </span>
        <span className="figma-ai-tw__aiaMcpJsonLine">
          <span className="figma-ai-tw__aiaMcpJsonKey">&quot;file_path&quot;</span>
          <span className="figma-ai-tw__aiaMcpJsonPunc">: </span>
          <span className="figma-ai-tw__aiaMcpJsonStr">&quot;.ai/local.md&quot;</span>
          <span className="figma-ai-tw__aiaMcpJsonPunc">, </span>
        </span>
        <span className="figma-ai-tw__aiaMcpJsonLine">
          <span className="figma-ai-tw__aiaMcpJsonKey">&quot;mode&quot;</span>
          <span className="figma-ai-tw__aiaMcpJsonPunc">: </span>
          <span className="figma-ai-tw__aiaMcpJsonStr">&quot;slice&quot;</span>
          <span className="figma-ai-tw__aiaMcpJsonPunc">, </span>
        </span>
        <span className="figma-ai-tw__aiaMcpJsonLine">
          <span className="figma-ai-tw__aiaMcpJsonKey">&quot;start_line&quot;</span>
          <span className="figma-ai-tw__aiaMcpJsonPunc">: </span>
          <span className="figma-ai-tw__aiaMcpJsonNum">1</span>
          <span className="figma-ai-tw__aiaMcpJsonPunc">, </span>
        </span>
        <span className="figma-ai-tw__aiaMcpJsonLine">
          <span className="figma-ai-tw__aiaMcpJsonKey">&quot;max_lines&quot;</span>
          <span className="figma-ai-tw__aiaMcpJsonPunc">: </span>
          <span className="figma-ai-tw__aiaMcpJsonNum">200</span>
        </span>
        <span className="figma-ai-tw__aiaMcpJsonLine">
          <span className="figma-ai-tw__aiaMcpJsonPunc">{'}'}</span>
        </span>
      </p>
    </div>
  )
}

function AiaMcpReadFileJsonTooltipBody() {
  return <AiaMcpReadFileArgsHighlighted layout="multiline" />
}

type ApprovalConfirmSource = 'click' | 'shortcut'

type SnippetDetailsRequestApprovalProps = {
  setOptionButtonRef: (index: number, el: HTMLButtonElement | null) => void
  focusIndex: number
  setFocusIndex: (i: number) => void
  onConfirm: (index: number, source: ApprovalConfirmSource) => void
  /**
   * Blue row + ⏎ when pointer is over AI Chat (except composer) or an option has focus — unless the composer is focused.
   * Grey when pointer is outside chat or the message composer textarea is focused.
   */
  optionRowProminent: boolean
  /** When the composer is focused: the selected (grey) row shows ↑ instead of ⏎ in the ghost slot. */
  composerFocused: boolean
  /** Option button `id`s (must be unique on the page when multiple approval blocks exist). */
  optionIds?: readonly string[]
  /** `aria-label` on the listbox wrapper. */
  listboxAriaLabel?: string
  /** Ghost hint on the focused row: Enter (feed) vs ↑↓ (composer-docked list). */
  listNavigationHint?: 'enter' | 'arrows'
}

/** Keep the header row pinned in the viewport while the log panel opens below. */
function anchorCmdLogExpandToggle(
  scrollRef: RefObject<HTMLDivElement | null>,
  suppressFeedScrollPinUntilRef: MutableRefObject<number>,
  setExpanded: Dispatch<SetStateAction<boolean>>,
  event: ReactMouseEvent<HTMLElement>,
) {
  const header = event.currentTarget.closest('.figma-ai-tw__snippet')?.querySelector(
    '.figma-ai-tw__snippetHeader',
  ) as HTMLElement | null
  anchorFeedGrowthDown(scrollRef.current, suppressFeedScrollPinUntilRef, header, () =>
    setExpanded((v) => !v),
  )
}

/** Open the log panel from the compact stream preview (same scroll anchor as header Expand). */
function anchorCmdLogExpandOpen(
  scrollRef: RefObject<HTMLDivElement | null>,
  suppressFeedScrollPinUntilRef: MutableRefObject<number>,
  setExpanded: Dispatch<SetStateAction<boolean>>,
  snippetRoot: HTMLElement | null,
) {
  const header = snippetRoot?.querySelector('.figma-ai-tw__snippetHeader') as HTMLElement | null
  anchorFeedGrowthDown(scrollRef.current, suppressFeedScrollPinUntilRef, header, () => setExpanded(true))
}

/** One-line agent narration between default-variant command snippets (not grouped in a single block). */
export function AiaCmdBridgeParagraph({ children }: { children: ReactNode }) {
  return <p className="figma-ai-tw__paragraph figma-ai-tw__paragraph--aiaCmdBridge">{children}</p>
}

/** After the user rejects a pending command — status + follow-up prompt (instructions via main composer). */
export function AiaCmdRejectionFeedback({ submittedText }: { submittedText?: string | null }) {
  return (
    <div className="figma-ai-tw__aiaCmdRejectionFeedback">
      <p className="figma-ai-tw__aiaCmdRejectionFeedbackStatus">User rejected the command.</p>
      <p className="figma-ai-tw__aiaCmdRejectionFeedbackPrompt">
        <span className="figma-ai-tw__aiaCmdRejectionFeedbackSpark" aria-hidden>
          <IconImg src={ideIcons.chatMode} alt="" />
        </span>
        What should Claude do instead?
      </p>
      {submittedText ? (
        <>
          <p className="figma-ai-tw__aiaCmdRejectionFeedbackStatus">User replied</p>
          <p className="figma-ai-tw__aiaCmdRejectionFeedbackSent">{submittedText}</p>
        </>
      ) : null}
    </div>
  )
}

/** Composer-docked MCP approval — full tool + JSON, wraps inside gray cmd face (like npm row). */
export function AiaComposerMcpPermissionCmdBlock() {
  const mono = `${AIA_MCP_READ_FILE_TOOL} ${AIA_MCP_READ_FILE_ARGS_PREVIEW}`
  return (
    <AiaSnippetCmdLine
      className="figma-ai-tw__snippetCmd figma-ai-tw__snippetCmd--composerPermissionCmd figma-ai-tw__snippetCmd--composerPermissionMcp"
      mono={mono}
    >
      <span className="figma-ai-tw__composerPermissionMcpIcon" aria-hidden>
        <IconMcp className="figma-ai-tw__aiaMcpIconSvg" />
      </span>
      <span className="figma-ai-tw__aiaMcpToolName">{AIA_MCP_READ_FILE_TOOL} </span>
      <span className="figma-ai-tw__composerPermissionMcpArgs">{AIA_MCP_READ_FILE_ARGS_PREVIEW}</span>
    </AiaSnippetCmdLine>
  )
}

/** Composer-docked npm approval — subdued mono in permission face (flags muted like MCP args). */
export function AiaComposerNpmInitPermissionCmdLine() {
  return (
    <AiaSnippetCmdLine
      className="figma-ai-tw__snippetCmd figma-ai-tw__snippetCmd--composerPermissionCmd"
      mono={AIA_COMPOSER_NPM_INIT_CMD_MONO}
      highlight={AIA_CMD_HIGHLIGHT_COMPOSER_NPM_INIT}
    >
      <span className="figma-ai-tw__composerPermissionTerminalIcon" aria-hidden>
        <IconTerminal />
      </span>
      {AIA_CMD_HIGHLIGHT_COMPOSER_NPM_INIT}
    </AiaSnippetCmdLine>
  )
}

export function SnippetDetailsRequestApproval({
  setOptionButtonRef,
  focusIndex,
  setFocusIndex,
  onConfirm,
  optionRowProminent,
  composerFocused,
  optionIds = APPROVAL_OPTION_IDS,
  listboxAriaLabel = 'Choose how to proceed',
  listNavigationHint = 'enter',
}: SnippetDetailsRequestApprovalProps) {
  const showAltShortcuts = listNavigationHint !== 'arrows'

  const approvalNavHints = (visible: boolean) => (
    <span
      className={[
        'figma-ai-tw__approvalNavHints',
        visible ? '' : 'figma-ai-tw__approvalNavHints--reserve',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <span className="figma-ai-tw__shortcut figma-ai-tw__shortcut--ghost figma-ai-tw__shortcut--ghostArrow">
        <IconArrowUpShortcut />
      </span>
      <span className="figma-ai-tw__shortcut figma-ai-tw__shortcut--ghost figma-ai-tw__shortcut--ghostArrow">
        <IconArrowDownShortcut />
      </span>
    </span>
  )

  const approvalGhostHint = (rowIndex: number) => {
    if (listNavigationHint === 'arrows') return null
    if (focusIndex === rowIndex && optionRowProminent && listNavigationHint === 'enter') {
      return (
        <span className="figma-ai-tw__shortcut figma-ai-tw__shortcut--ghost" aria-hidden>
          ⏎
        </span>
      )
    }
    if (focusIndex === rowIndex && composerFocused) {
      return (
        <span className="figma-ai-tw__shortcut figma-ai-tw__shortcut--ghost figma-ai-tw__shortcut--ghostArrow" aria-hidden>
          <IconArrowUpShortcut />
        </span>
      )
    }
    return null
  }

  const approvalOptionTrailing = (rowIndex: number) => {
    if (!showAltShortcuts && listNavigationHint === 'arrows') {
      const isSelectedRow = focusIndex === rowIndex
      if (composerFocused && isSelectedRow) {
        return (
          <span className="figma-ai-tw__approvalShortcuts">
            <span
              className="figma-ai-tw__shortcut figma-ai-tw__shortcut--ghost figma-ai-tw__shortcut--ghostArrow"
              aria-hidden
            >
              <IconArrowUpShortcut />
            </span>
          </span>
        )
      }
      const navVisible = isSelectedRow && optionRowProminent
      return (
        <span className="figma-ai-tw__approvalShortcuts">
          {approvalNavHints(navVisible)}
        </span>
      )
    }
    const hint = approvalGhostHint(rowIndex)
    if (!hint && !showAltShortcuts) return null
    return (
      <span className="figma-ai-tw__approvalShortcuts">
        {hint}
        {showAltShortcuts ? (
          <span className="figma-ai-tw__shortcut">{APPROVAL_SHORTCUTS[rowIndex]}</span>
        ) : null}
      </span>
    )
  }

  return (
    <div className="figma-ai-tw__approval" role="listbox" aria-label={listboxAriaLabel}>
      <button
        type="button"
        id={optionIds[0]}
        ref={(el) => setOptionButtonRef(0, el)}
        role="option"
        tabIndex={focusIndex === 0 ? 0 : -1}
        aria-selected={focusIndex === 0}
        className={`figma-ai-tw__approvalItem ${focusIndex === 0 ? 'figma-ai-tw__approvalItem--selected' : ''}${focusIndex === 0 && !optionRowProminent ? ' figma-ai-tw__approvalItem--selected-muted' : ''}`}
        onFocus={() => setFocusIndex(0)}
        {...(showAltShortcuts ? { 'aria-keyshortcuts': 'Alt+1' } : {})}
        onClick={() => onConfirm(0, 'click')}
      >
        <span className="figma-ai-tw__icon16">
          <IconImg src={ideIcons.checkmark} alt="" />
        </span>
        <span className="figma-ai-tw__approvalText">Yes</span>
        {approvalOptionTrailing(0)}
      </button>
      <button
        type="button"
        id={optionIds[1]}
        ref={(el) => setOptionButtonRef(1, el)}
        role="option"
        tabIndex={focusIndex === 1 ? 0 : -1}
        aria-selected={focusIndex === 1}
        className={`figma-ai-tw__approvalItem ${focusIndex === 1 ? 'figma-ai-tw__approvalItem--selected' : ''}${focusIndex === 1 && !optionRowProminent ? ' figma-ai-tw__approvalItem--selected-muted' : ''}`}
        onFocus={() => setFocusIndex(1)}
        {...(showAltShortcuts ? { 'aria-keyshortcuts': 'Alt+2' } : {})}
        onClick={() => onConfirm(1, 'click')}
      >
        <span className="figma-ai-tw__icon16">
          <IconImg src={ideIcons.checkmark} alt="" />
        </span>
        <span className="figma-ai-tw__approvalText">Yes, allow all edits during this session</span>
        {approvalOptionTrailing(1)}
      </button>
      <button
        type="button"
        id={optionIds[2]}
        ref={(el) => setOptionButtonRef(2, el)}
        role="option"
        tabIndex={focusIndex === 2 ? 0 : -1}
        aria-selected={focusIndex === 2}
        className={`figma-ai-tw__approvalItem ${focusIndex === 2 ? 'figma-ai-tw__approvalItem--selected' : ''}${focusIndex === 2 && !optionRowProminent ? ' figma-ai-tw__approvalItem--selected-muted' : ''}`}
        onFocus={() => setFocusIndex(2)}
        {...(showAltShortcuts ? { 'aria-keyshortcuts': 'Alt+3' } : {})}
        onClick={() => onConfirm(2, 'click')}
      >
        <span className="figma-ai-tw__icon16 figma-ai-tw__icon16--ban">
          <IconBanSmall />
        </span>
        <span className="figma-ai-tw__approvalText">No, and tell Claude what to do differently</span>
        {approvalOptionTrailing(2)}
      </button>
    </div>
  )
}

/** Skip + primary Submit at the bottom of composer-docked permission cards. */
export function ComposerPermissionSubmit({
  submitRef,
  skipRef,
  onSubmit,
  onSkip,
}: {
  submitRef?: (el: HTMLButtonElement | null) => void
  skipRef?: (el: HTMLButtonElement | null) => void
  onSubmit: () => void
  onSkip?: () => void
}) {
  return (
    <div className="figma-ai-tw__composerPermissionSubmitBar">
      <Button
        type="secondary"
        size="slim"
        ref={skipRef}
        className="figma-ai-tw__composerPermissionSkipBtn"
        tabIndex={-1}
        aria-keyshortcuts="Escape"
        onClick={onSkip}
      >
        Skip
        <span className="figma-ai-tw__composerPermissionBtnShortcut" aria-hidden>
          Esc
        </span>
      </Button>
      <Button
        type="primary"
        size="slim"
        ref={submitRef}
        className="figma-ai-tw__composerPermissionSubmitBtn"
        tabIndex={-1}
        aria-keyshortcuts="Enter"
        onClick={onSubmit}
      >
        Submit
        <span
          className="figma-ai-tw__composerPermissionBtnShortcut figma-ai-tw__composerPermissionBtnShortcut--onPrimary"
          aria-hidden
        >
          ⏎
        </span>
      </Button>
    </div>
  )
}

export type FigmaAiToolwindowVariant = 'default' | 'thinkingWgToolcalls' | 'agenticVcs'

/** Open default-chat command output in the editor tab strip (IDE web demo). */
export type FigmaAiOpenCommandTabKind = 'sed' | 'npm' | 'mcp' | 'npmFollow1' | 'npmFollow2'

export type FigmaAiToolwindowProps = {
  /**
   * When greater than 0: the completed "Ran" command card shows a loader for this long,
   * the pending "Run" + approval block stays out of the layout; then the loader clears
   * and the approval card appears with options immediately.
   */
  approvalRevealDelayMs?: number
  /** `thinkingWgToolcalls`: gray read-only toolcall list + Launched Commands collapse (Thinking/WG task). */
  figmaAiVariant?: FigmaAiToolwindowVariant
  /** Only when `figmaAiVariant === 'thinkingWgToolcalls'`: list-reveal, summary-first, or summary + running-command preview. */
  thinkingWgToolcallsMode?: ThinkingWgToolcallsMode
  /** DialKit right panel: `auto` = timed demo; `empty` / `partial` / `full` = frozen storyboard frame. */
  thinkingWgDemoControl?: ThinkingWgDemoControl
  /** Bump to remount the WG panel (restart auto animation from a clean state). */
  thinkingWgPanelKey?: number
  /** `reasoning` — thinking-only copy; `mixed` — Working Group (terminal summary + interleaved reasoning + commands). */
  thinkingWgPanelKind?: ThinkingWgPanelKind
  /** Mixed #0 collapsed-panel trace: Drafts use `noIconsFailedPrefix` (V2) / `timelineDots` (V6 segmented icons). */
  thinkingWgMixedCpTraceStyle?: ThinkingWgMixedCpTraceStyle
  /** Thinking #0 CP: vertical spine beside header icon + reasoning body (peek / expanded). */
  thinkingWgCpTimelineSpine?: boolean
  /** Mixed expanded `#thinking-wg-command-list` spine: `segmented` (default) vs `continuous` gutter rail. */
  thinkingWgMixedExpandRailVariant?: ThinkingWgMixedExpandRailVariant
  /**
   * Mixed `#4` preview-last3 route only: show reasoning / terminal icons in the three-line preview and in the expanded
   * loading-strip list (`data-wg-mixed-loading-strip-icons`).
   */
  thinkingWgMixedLast3WithStepIcons?: boolean
  /**
   * Mixed #0 CP full-page variant: flat interleaved trace in the feed (no section header / peek cap) until
   * auto-collapse to the one-line summary row.
   */
  thinkingWgMixedCpFullPage?: boolean
  /**
   * When true with `figmaAiVariant === 'thinkingWgToolcalls'`: render only the scrollable AI response column
   * (`.figma-ai-tw__aiBlock` + Thinking WG panel) — no chat chrome, user prompt, composer, or footer.
   */
  isolateAiBlockOnly?: boolean
  /**
   * When set (full IDE shell only): “Open in tool window” on default AIA command rows opens a terminal-style
   * editor tab (`sed` / `npm`) or an MCP log tab (`mcp`).
   */
  onOpenCommandInEditorTab?: (kind: FigmaAiOpenCommandTabKind) => void
  /**
   * Freeze default AIA chat at a post-run snapshot: no approval delay, no scripted npm/MCP chain,
   * no stream intervals. Expand/collapse and keyboard approval still work on interaction.
   */
  staticDefaultChat?: boolean
  /**
   * Default AIA chat: while approval choices are open, show the pending command + options in the
   * composer slot instead of the message field; after confirm, the row appears in the feed as usual.
   */
  approvalInComposer?: boolean
  /**
   * With `approvalInComposer`: keep npm/MCP permission UI in the composer only — feed stops after the
   * first `sed` row (no bridge paragraphs or follow-on command rows in the scroll area).
   */
  aiaComposerOnlyPermissions?: boolean
  /** Agentic VCS snapshot: focus the native Commit / VCS review surface for the linked AI changelist. */
  onReviewInVcs?: () => void
}

function AgenticVcsAiBlock({ onReviewInVcs }: { onReviewInVcs?: () => void }) {
  const [expandedGroups, setExpandedGroups] = useState(() => new Set(['ide-web-demo', 'billing-service']))

  const resultGroups = [
    {
      id: 'ide-web-demo',
      label: 'ide-web-demo',
      count: '5 files',
      files: [
        { name: 'RequestLoggingFilter.java', icon: 'fileTypes/java', added: 76, deleted: 0 },
        { name: 'LoggingConfiguration.java', icon: 'fileTypes/java', added: 32, deleted: 0 },
        { name: 'RequestLoggingFilterTest.java', icon: 'fileTypes/java', added: 61, deleted: 0 },
        { name: 'application.yml', icon: 'fileTypes/yaml', added: 3, deleted: 1 },
        { name: 'UserController.java', icon: 'fileTypes/java', added: 10, deleted: 4, mixed: true },
      ],
    },
    {
      id: 'billing-service',
      label: 'billing-service',
      count: '3 files',
      files: [
        { name: 'MoneyFormatter.kt', icon: 'fileTypes/java', added: 18, deleted: 2 },
        { name: 'RoundingPolicyTest.kt', icon: 'fileTypes/java', added: 44, deleted: 0 },
        { name: 'README.md', icon: 'fileTypes/markdown', added: 5, deleted: 1, manual: true },
      ],
    },
  ]

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="figma-ai-tw__agenticVcs">
      <p className="figma-ai-tw__paragraph">
        I put everything from this session into a dedicated AI changelist so you can review it as one unit.
      </p>
      <p className="figma-ai-tw__paragraph">
        Done. Five files changed. Four files are agent-authored; one file has mixed authorship because your local
        controller edit touches the same review unit.
      </p>
      <div className="figma-ai-tw__vcsResultCard">
        <div className="figma-ai-tw__vcsResultHeader">
          <span className="figma-ai-tw__vcsResultTitle">8 files updated</span>
          <span className="figma-ai-tw__vcsResultStats">
            <span className="is-added">+249</span>
            <span className="is-deleted">-8</span>
          </span>
          <Button type="primary" onClick={onReviewInVcs}>Review</Button>
        </div>
        <div className="figma-ai-tw__vcsResultGroups">
          {resultGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id)
            return (
              <div key={group.id} className="figma-ai-tw__vcsResultGroup">
                <button
                  type="button"
                  className="figma-ai-tw__vcsResultGroupHead"
                  aria-expanded={isExpanded}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span aria-hidden>{isExpanded ? '⌄' : '›'}</span>
                  <Icon name="nodes/folder" size={16} />
                  <strong>{group.label}</strong>
                  <em>{group.count}</em>
                </button>
                {isExpanded ? (
                  <div className="figma-ai-tw__vcsResultFiles">
                    {group.files.map((file) => (
                      <button
                        key={`${group.id}-${file.name}`}
                        type="button"
                        className="figma-ai-tw__vcsResultFile"
                        onClick={onReviewInVcs}
                      >
                        <Icon name={file.icon} size={16} />
                        <span>{file.name}</span>
                        {file.mixed ? <b>MIX</b> : null}
                        {file.manual ? <i>Manual</i> : null}
                        <small>
                          <span className="is-added">+{file.added}</span>
                          {file.deleted ? <span className="is-deleted">-{file.deleted}</span> : null}
                        </small>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Right tool window body from Figma node 1:2525 (Toolwindow → AIA Chat). */
export function FigmaAiToolwindow({
  approvalRevealDelayMs = 0,
  figmaAiVariant = 'default',
  thinkingWgToolcallsMode = 'listReveal',
  thinkingWgDemoControl = 'auto',
  thinkingWgPanelKey = 0,
  thinkingWgPanelKind = 'toolcalls',
  thinkingWgMixedCpTraceStyle,
  thinkingWgCpTimelineSpine = false,
  thinkingWgMixedExpandRailVariant = 'segmented',
  thinkingWgMixedLast3WithStepIcons = false,
  thinkingWgMixedCpFullPage = false,
  isolateAiBlockOnly = false,
  onOpenCommandInEditorTab,
  staticDefaultChat = false,
  approvalInComposer = false,
  aiaComposerOnlyPermissions = false,
  onReviewInVcs,
}: FigmaAiToolwindowProps) {
  const revealDelayMs =
    staticDefaultChat || approvalRevealDelayMs <= 0 ? 0 : approvalRevealDelayMs
  const [approvalChoicesVisible, setApprovalChoicesVisible] = useState(
    () => staticDefaultChat || revealDelayMs <= 0,
  )

  const [approvalOpen, setApprovalOpen] = useState(() => !staticDefaultChat)
  const [approvalFocusIndex, setApprovalFocusIndex] = useState(0)
  const [approvalOptionDomFocused, setApprovalOptionDomFocused] = useState(true)
  /** True when cursor is over .figma-ai-tw but not over the composer strip. */
  const [pointerInChatExcludingComposer, setPointerInChatExcludingComposer] = useState(true)
  const [approvalCompleted, setApprovalCompleted] = useState(() => staticDefaultChat)
  const [approvalRejected, setApprovalRejected] = useState(false)
  const [rejectionFeedbackMessage, setRejectionFeedbackMessage] = useState<string | null>(null)
  const [approvalInProgress, setApprovalInProgress] = useState(false)
  /** How many lines of {@link APPROVAL_NPM_INIT_STREAM_LINES} are revealed (compact stream fills bottom-up). */
  const [approvalNpmStreamCount, setApprovalNpmStreamCount] = useState(() =>
    staticDefaultChat ? APPROVAL_NPM_INIT_STREAM_LINES.length : 0,
  )
  /** When approval is open: used so the composer stays tabbable if the user is drafting a message. */
  const [composerHasDraft, setComposerHasDraft] = useState(false)
  const [composerFocused, setComposerFocused] = useState(false)
  /** Thinking WG: composer trailing icon is stop while the scripted stream runs, then send. */
  const [thinkingWgComposerTrailing, setThinkingWgComposerTrailing] = useState<'send' | 'stop'>(() =>
    figmaAiVariant === 'thinkingWgToolcalls' ? 'stop' : 'send',
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const suppressFeedScrollPinUntilRef = useRef(0)
  const feedRef = useRef<HTMLDivElement>(null)
  const approvalOptionButtonRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null])
  const composerPermissionSubmitRef = useRef<HTMLButtonElement | null>(null)
  const composerPermissionSkipRef = useRef<HTMLButtonElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const approvalFocusIndexRef = useRef(approvalFocusIndex)
  const approvalProgressTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const mcpOptionButtonRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null])
  const mcpProgressTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const mcpFocusIndexRef = useRef(0)
  const aiaNpmFollowTimersRef = useRef<ReturnType<typeof window.setTimeout>[]>([])
  const mcpSnippetGateTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)

  const [mcpApprovalOpen, setMcpApprovalOpen] = useState(() => !staticDefaultChat)
  const [mcpFocusIndex, setMcpFocusIndex] = useState(0)
  const [mcpOptionDomFocused, setMcpOptionDomFocused] = useState(true)
  const [mcpCompleted, setMcpCompleted] = useState(() => staticDefaultChat)
  const [mcpApprovalRejected, setMcpApprovalRejected] = useState(false)
  const [mcpInProgress, setMcpInProgress] = useState(false)
  /** MCP snippet mounts only after chained npm rows fully finish + {@link AIA_LINEAR_DWELL_BEFORE_MCP_MS}. */
  const [mcpSnippetGateOpen, setMcpSnippetGateOpen] = useState(() => staticDefaultChat)

  /** Expanded command log under default-chat rows (trailing “Expand”). */
  const [aiaFirstCmdLogExpanded, setAiaFirstCmdLogExpanded] = useState(false)
  const [aiaNpmCmdLogExpanded, setAiaNpmCmdLogExpanded] = useState(false)
  const [aiaMcpCmdLogExpanded, setAiaMcpCmdLogExpanded] = useState(false)

  const toggleFirstCmdLog = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      anchorCmdLogExpandToggle(scrollRef, suppressFeedScrollPinUntilRef, setAiaFirstCmdLogExpanded, event)
    },
    [],
  )
  const openFirstCmdLogFromCompact = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    anchorCmdLogExpandOpen(
      scrollRef,
      suppressFeedScrollPinUntilRef,
      setAiaFirstCmdLogExpanded,
      event.currentTarget.closest('.figma-ai-tw__snippet'),
    )
  }, [])
  const toggleNpmCmdLog = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      anchorCmdLogExpandToggle(scrollRef, suppressFeedScrollPinUntilRef, setAiaNpmCmdLogExpanded, event)
    },
    [],
  )
  const openNpmCmdLogFromCompact = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    anchorCmdLogExpandOpen(
      scrollRef,
      suppressFeedScrollPinUntilRef,
      setAiaNpmCmdLogExpanded,
      event.currentTarget.closest('.figma-ai-tw__snippet'),
    )
  }, [])
  const toggleMcpCmdLog = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      anchorCmdLogExpandToggle(scrollRef, suppressFeedScrollPinUntilRef, setAiaMcpCmdLogExpanded, event)
    },
    [],
  )
  const openMcpCmdLogFromCompact = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    anchorCmdLogExpandOpen(
      scrollRef,
      suppressFeedScrollPinUntilRef,
      setAiaMcpCmdLogExpanded,
      event.currentTarget.closest('.figma-ai-tw__snippet'),
    )
  }, [])

  type AiaNpmFollowRowPhase = 'hidden' | 'running' | 'done'
  const [aiaNpmFollowRow1Phase, setAiaNpmFollowRow1Phase] = useState<AiaNpmFollowRowPhase>(() =>
    staticDefaultChat ? 'done' : 'hidden',
  )
  const [aiaNpmFollowRow2Phase, setAiaNpmFollowRow2Phase] = useState<AiaNpmFollowRowPhase>(() =>
    staticDefaultChat ? 'done' : 'hidden',
  )
  const [aiaNpmFollow1LogExpanded, setAiaNpmFollow1LogExpanded] = useState(false)
  const [aiaNpmFollow2LogExpanded, setAiaNpmFollow2LogExpanded] = useState(false)
  const [firstRowStreamCount, setFirstRowStreamCount] = useState(0)
  const [aiaNpmFollow1StreamCount, setAiaNpmFollow1StreamCount] = useState(0)
  const [aiaNpmFollow2StreamCount, setAiaNpmFollow2StreamCount] = useState(0)
  const [mcpStreamCount, setMcpStreamCount] = useState(0)

  const toggleNpmFollow1Log = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      anchorCmdLogExpandToggle(scrollRef, suppressFeedScrollPinUntilRef, setAiaNpmFollow1LogExpanded, event)
    },
    [],
  )
  const openNpmFollow1LogFromCompact = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    anchorCmdLogExpandOpen(
      scrollRef,
      suppressFeedScrollPinUntilRef,
      setAiaNpmFollow1LogExpanded,
      event.currentTarget.closest('.figma-ai-tw__snippet'),
    )
  }, [])
  const toggleNpmFollow2Log = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      anchorCmdLogExpandToggle(scrollRef, suppressFeedScrollPinUntilRef, setAiaNpmFollow2LogExpanded, event)
    },
    [],
  )
  const openNpmFollow2LogFromCompact = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    anchorCmdLogExpandOpen(
      scrollRef,
      suppressFeedScrollPinUntilRef,
      setAiaNpmFollow2LogExpanded,
      event.currentTarget.closest('.figma-ai-tw__snippet'),
    )
  }, [])

  const setMcpOptionButtonRef = useCallback((index: number, el: HTMLButtonElement | null) => {
    mcpOptionButtonRefs.current[index] = el
  }, [])

  const setOptionButtonRef = useCallback((index: number, el: HTMLButtonElement | null) => {
    approvalOptionButtonRefs.current[index] = el
  }, [])

  useEffect(() => {
    approvalFocusIndexRef.current = approvalFocusIndex
  }, [approvalFocusIndex])

  useEffect(() => {
    if (figmaAiVariant !== 'thinkingWgToolcalls') {
      setThinkingWgComposerTrailing('send')
      return
    }
    setThinkingWgComposerTrailing('stop')
  }, [
    figmaAiVariant,
    thinkingWgToolcallsMode,
    thinkingWgPanelKind,
    thinkingWgPanelKey,
    thinkingWgMixedCpTraceStyle,
    thinkingWgMixedExpandRailVariant,
    thinkingWgMixedLast3WithStepIcons,
    thinkingWgMixedCpFullPage,
  ])

  useEffect(() => {
    if (staticDefaultChat || revealDelayMs <= 0) return
    const id = window.setTimeout(() => setApprovalChoicesVisible(true), revealDelayMs)
    return () => window.clearTimeout(id)
  }, [revealDelayMs, staticDefaultChat])

  const showApprovalChoices = approvalOpen && approvalChoicesVisible
  const delayedRevealWaiting = revealDelayMs > 0 && !approvalChoicesVisible
  const showRunApprovalSnippet = revealDelayMs <= 0 || approvalChoicesVisible || !approvalOpen

  const approvalChromeActive = figmaAiVariant === 'default'
  const showApprovalChoicesUi = approvalChromeActive && showApprovalChoices
  const delayedRevealWaitingUi = approvalChromeActive && delayedRevealWaiting
  const showRunApprovalSnippetUi = approvalChromeActive && showRunApprovalSnippet

  const showMcpSnippetUi =
    approvalChromeActive &&
    approvalCompleted &&
    !approvalInProgress &&
    showRunApprovalSnippet &&
    mcpSnippetGateOpen
  const showMcpApprovalChoicesUi = showMcpSnippetUi && mcpApprovalOpen && !mcpInProgress

  const approvalInComposerActive = approvalInComposer && approvalChromeActive
  const npmApprovalInComposer =
    approvalInComposerActive && showApprovalChoicesUi
  const mcpApprovalInComposer =
    approvalInComposerActive && showMcpApprovalChoicesUi
  const composerShowsApprovalDock = npmApprovalInComposer || mcpApprovalInComposer
  const awaitingRejectionFeedback =
    (approvalRejected || mcpApprovalRejected) && rejectionFeedbackMessage === null

  const FEED_SCROLL_PIN_THRESHOLD_PX = 96

  const scrollChatToBottom = useCallback((opts?: { force?: boolean }) => {
    const scroller = scrollRef.current
    if (!scroller) return
    if (!opts?.force) {
      const distanceFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
      if (distanceFromBottom > FEED_SCROLL_PIN_THRESHOLD_PX) return
    }
    scroller.scrollTop = scroller.scrollHeight
  }, [])

  useLayoutEffect(() => {
    scrollChatToBottom({ force: true })
  }, [scrollChatToBottom, composerShowsApprovalDock])

  useEffect(() => {
    const feed = feedRef.current
    if (!feed) return
    const ro = new ResizeObserver(() => {
      if (performance.now() < suppressFeedScrollPinUntilRef.current) return
      scrollChatToBottom()
    })
    ro.observe(feed)
    return () => ro.disconnect()
  }, [scrollChatToBottom])
  const showNpmSnippetInFeed =
    showRunApprovalSnippetUi && !npmApprovalInComposer && !aiaComposerOnlyPermissions
  const showMcpSnippetInFeed =
    showMcpSnippetUi && !mcpApprovalInComposer && !aiaComposerOnlyPermissions

  const showNpmCmdLog = approvalInProgress || aiaNpmCmdLogExpanded
  const npmCmdLogLines = approvalInProgress
    ? aiaNpmCmdLogExpanded
      ? APPROVAL_NPM_INIT_STREAM_LINES.slice(0, approvalNpmStreamCount).slice(-8)
      : APPROVAL_NPM_INIT_STREAM_LINES.slice(0, approvalNpmStreamCount)
    : [...APPROVAL_NPM_INIT_STREAM_LINES]

  const showNpmFollow1CmdLog =
    aiaNpmFollowRow1Phase === 'running' ||
    (aiaNpmFollowRow1Phase === 'done' && aiaNpmFollow1LogExpanded)
  const npmFollow1CmdLogLines =
    aiaNpmFollowRow1Phase === 'running'
      ? AIA_NPM_FOLLOW_INSTALL_STREAM_SCRIPT.slice(0, aiaNpmFollow1StreamCount)
      : [...AIA_NPM_FOLLOW_INSTALL_LOG_LINES]

  const showNpmFollow2CmdLog =
    aiaNpmFollowRow2Phase === 'running' ||
    (aiaNpmFollowRow2Phase === 'done' && aiaNpmFollow2LogExpanded)
  const npmFollow2CmdLogLines =
    aiaNpmFollowRow2Phase === 'running'
      ? AIA_NPM_FOLLOW_AUDIT_STREAM_SCRIPT.slice(0, aiaNpmFollow2StreamCount)
      : [...AIA_NPM_FOLLOW_AUDIT_LOG_LINES]

  const showMcpCmdLog = showMcpSnippetUi && (mcpInProgress || aiaMcpCmdLogExpanded)
  const mcpCmdLogLines: readonly string[] = !showMcpCmdLog
    ? []
    : mcpInProgress && !aiaMcpCmdLogExpanded
      ? AIA_MCP_CMD_STREAM_SCRIPT.slice(0, mcpStreamCount)
      : aiaMcpCmdLogExpanded
        ? mcpInProgress
          ? AIA_MCP_CMD_STREAM_SCRIPT
          : showMcpApprovalChoicesUi
            ? AIA_MCP_CMD_LOG_PENDING_LINES
            : AIA_MCP_CMD_LOG_LINES
        : []

  /** Muted while the composer is focused (e.g. arrow-keying into the input); blue when options own focus/pointer. */
  const approvalOptionsProminent =
    !composerFocused &&
    (npmApprovalInComposer
      ? approvalOptionDomFocused
      : approvalOptionDomFocused || pointerInChatExcludingComposer)

  const mcpApprovalOptionsProminent =
    !composerFocused &&
    (mcpApprovalInComposer
      ? mcpOptionDomFocused
      : mcpOptionDomFocused || pointerInChatExcludingComposer)

  useEffect(() => {
    mcpFocusIndexRef.current = mcpFocusIndex
  }, [mcpFocusIndex])

  const syncMcpApprovalOptionDomFocus = useCallback(() => {
    const ae = document.activeElement
    const opts = mcpOptionButtonRefs.current
    setMcpOptionDomFocused(opts.some((b) => b !== null && b === ae))
  }, [])

  const syncApprovalOptionDomFocus = useCallback(() => {
    const ae = document.activeElement
    const opts = approvalOptionButtonRefs.current
    setApprovalOptionDomFocused(opts.some((b) => b !== null && b === ae))
  }, [])

  const updatePointerInChatExcludingComposer = useCallback((clientX: number, clientY: number) => {
    const root = rootRef.current
    if (!root) return
    const hit = document.elementFromPoint(clientX, clientY)
    if (!(hit instanceof Element) || !root.contains(hit)) {
      setPointerInChatExcludingComposer(false)
      return
    }
    if (hit.closest('.figma-ai-tw__inputSection')) {
      setPointerInChatExcludingComposer(false)
      return
    }
    setPointerInChatExcludingComposer(true)
  }, [])

  useEffect(() => {
    if (!showApprovalChoicesUi && !showMcpApprovalChoicesUi) return
    const onDocFocus = () => {
      queueMicrotask(() => {
        syncApprovalOptionDomFocus()
        syncMcpApprovalOptionDomFocus()
      })
    }
    document.addEventListener('focusin', onDocFocus, true)
    document.addEventListener('focusout', onDocFocus, true)
    queueMicrotask(() => {
      syncApprovalOptionDomFocus()
      syncMcpApprovalOptionDomFocus()
    })
    return () => {
      document.removeEventListener('focusin', onDocFocus, true)
      document.removeEventListener('focusout', onDocFocus, true)
    }
  }, [showApprovalChoicesUi, showMcpApprovalChoicesUi, syncApprovalOptionDomFocus, syncMcpApprovalOptionDomFocus])

  useEffect(() => {
    if (!npmApprovalInComposer) return
    queueMicrotask(() => approvalOptionButtonRefs.current[0]?.focus({ preventScroll: true }))
  }, [npmApprovalInComposer])

  useEffect(() => {
    if (!mcpApprovalInComposer) return
    queueMicrotask(() => mcpOptionButtonRefs.current[0]?.focus({ preventScroll: true }))
  }, [mcpApprovalInComposer])

  useEffect(() => {
    if (!showApprovalChoicesUi && !showMcpApprovalChoicesUi) return
    const onPointerMove = (e: PointerEvent) => {
      updatePointerInChatExcludingComposer(e.clientX, e.clientY)
    }
    window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove, true)
  }, [
    showApprovalChoicesUi,
    showMcpApprovalChoicesUi,
    updatePointerInChatExcludingComposer,
  ])

  useEffect(() => {
    return () => {
      if (approvalProgressTimerRef.current != null) {
        window.clearTimeout(approvalProgressTimerRef.current)
        approvalProgressTimerRef.current = null
      }
      if (mcpProgressTimerRef.current != null) {
        window.clearTimeout(mcpProgressTimerRef.current)
        mcpProgressTimerRef.current = null
      }
      if (mcpSnippetGateTimerRef.current != null) {
        window.clearTimeout(mcpSnippetGateTimerRef.current)
        mcpSnippetGateTimerRef.current = null
      }
    }
  }, [])

  /** After `npm init -y` finishes: two chained commands auto-run with staggered in-progress → done (prototype). */
  useEffect(() => {
    if (staticDefaultChat || aiaComposerOnlyPermissions) return
    aiaNpmFollowTimersRef.current.forEach((tid) => window.clearTimeout(tid))
    aiaNpmFollowTimersRef.current = []
    if (!approvalChromeActive || !approvalCompleted || approvalInProgress || !showRunApprovalSnippet) {
      setAiaNpmFollowRow1Phase('hidden')
      setAiaNpmFollowRow2Phase('hidden')
      setAiaNpmFollow1LogExpanded(false)
      setAiaNpmFollow2LogExpanded(false)
      return
    }
    const D = AIA_LINEAR_DWELL_AFTER_NPM_MS
    const R1 = AIA_NPM_FOLLOW_INSTALL_RUN_MS
    const R2 = AIA_NPM_FOLLOW_AUDIT_RUN_MS
    const G = AIA_NPM_FOLLOW_GAP_MS
    const schedule = (fn: () => void, ms: number) => {
      const tid = window.setTimeout(fn, ms)
      aiaNpmFollowTimersRef.current.push(tid)
    }
    schedule(() => setAiaNpmFollowRow1Phase('running'), D)
    schedule(() => setAiaNpmFollowRow1Phase('done'), D + R1)
    schedule(() => setAiaNpmFollowRow2Phase('running'), D + R1 + G)
    schedule(() => setAiaNpmFollowRow2Phase('done'), D + R1 + G + R2)
    return () => {
      aiaNpmFollowTimersRef.current.forEach((tid) => window.clearTimeout(tid))
      aiaNpmFollowTimersRef.current = []
    }
  }, [approvalChromeActive, approvalCompleted, approvalInProgress, showRunApprovalSnippet, staticDefaultChat, aiaComposerOnlyPermissions])

  /** MCP mounts only after both chained npm rows finish + dwell (no overlap with follow rows). */
  useEffect(() => {
    if (staticDefaultChat) return
    if (mcpSnippetGateTimerRef.current != null) {
      window.clearTimeout(mcpSnippetGateTimerRef.current)
      mcpSnippetGateTimerRef.current = null
    }
    const base = aiaComposerOnlyPermissions
      ? approvalChromeActive &&
        approvalCompleted &&
        !approvalInProgress &&
        showRunApprovalSnippet
      : approvalChromeActive &&
        approvalCompleted &&
        !approvalInProgress &&
        showRunApprovalSnippet &&
        aiaNpmFollowRow2Phase === 'done'
    if (!base) {
      setMcpSnippetGateOpen(false)
      return
    }
    mcpSnippetGateTimerRef.current = window.setTimeout(() => {
      mcpSnippetGateTimerRef.current = null
      setMcpSnippetGateOpen(true)
    }, AIA_LINEAR_DWELL_BEFORE_MCP_MS)
    return () => {
      if (mcpSnippetGateTimerRef.current != null) {
        window.clearTimeout(mcpSnippetGateTimerRef.current)
        mcpSnippetGateTimerRef.current = null
      }
    }
  }, [
    approvalChromeActive,
    approvalCompleted,
    approvalInProgress,
    showRunApprovalSnippet,
    aiaNpmFollowRow2Phase,
    staticDefaultChat,
    aiaComposerOnlyPermissions,
  ])

  useLayoutEffect(() => {
    if (!approvalInProgress) {
      const t = window.setTimeout(() => setApprovalNpmStreamCount(0), AIA_CMD_EXPAND_REVEAL_MS)
      return () => window.clearTimeout(t)
    }
    setApprovalNpmStreamCount(0)
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      if (n > APPROVAL_NPM_INIT_STREAM_LINES.length) {
        window.clearInterval(id)
        return
      }
      setApprovalNpmStreamCount(n)
    }, 480)
    return () => window.clearInterval(id)
  }, [approvalInProgress])

  const confirmApproval = useCallback((index: number, _source: ApprovalConfirmSource) => {
    if (index === 2) {
      suppressFeedScrollPinUntilRef.current =
        performance.now() + AIA_CMD_EXPAND_REVEAL_MS + AIA_FEED_SCROLL_PIN_GRACE_MS
      setApprovalOpen(false)
      setApprovalRejected(true)
      setRejectionFeedbackMessage(null)
      setApprovalInProgress(false)
      setAiaNpmCmdLogExpanded(true)
      return
    }
    setApprovalRejected(false)
    setApprovalOpen(false)
    setApprovalInProgress(true)
    if (approvalProgressTimerRef.current != null) {
      window.clearTimeout(approvalProgressTimerRef.current)
    }
    approvalProgressTimerRef.current = window.setTimeout(() => {
      approvalProgressTimerRef.current = null
      setApprovalInProgress(false)
      setApprovalCompleted(true)
    }, APPROVAL_IN_PROGRESS_MS)
  }, [])

  const confirmMcpApproval = useCallback((index: number, _source: ApprovalConfirmSource) => {
    if (index === 2) {
      suppressFeedScrollPinUntilRef.current =
        performance.now() + AIA_CMD_EXPAND_REVEAL_MS + AIA_FEED_SCROLL_PIN_GRACE_MS
      setMcpApprovalOpen(false)
      setMcpApprovalRejected(true)
      setRejectionFeedbackMessage(null)
      setMcpInProgress(false)
      setAiaMcpCmdLogExpanded(true)
      return
    }
    setMcpApprovalRejected(false)
    setMcpApprovalOpen(false)
    setMcpInProgress(true)
    if (mcpProgressTimerRef.current != null) {
      window.clearTimeout(mcpProgressTimerRef.current)
    }
    mcpProgressTimerRef.current = window.setTimeout(() => {
      mcpProgressTimerRef.current = null
      setMcpInProgress(false)
      setMcpCompleted(true)
    }, APPROVAL_IN_PROGRESS_MS)
  }, [])

  const dismissApproval = useCallback(() => {
    setApprovalOpen(false)
  }, [])

  const dismissMcpApproval = useCallback(() => {
    setMcpApprovalOpen(false)
  }, [])

  useLayoutEffect(() => {
    if (!delayedRevealWaitingUi || revealDelayMs <= 0) {
      if (revealDelayMs > 0) {
        const t = window.setTimeout(() => setFirstRowStreamCount(0), AIA_CMD_EXPAND_REVEAL_MS)
        return () => window.clearTimeout(t)
      }
      setFirstRowStreamCount(0)
      return
    }
    const script = AIA_FIRST_ROW_WAIT_STREAM_LINES
    setFirstRowStreamCount(0)
    let n = 0
    const tick = Math.max(120, Math.floor(revealDelayMs / Math.max(script.length, 1)))
    const id = window.setInterval(() => {
      n += 1
      if (n > script.length) {
        window.clearInterval(id)
        return
      }
      setFirstRowStreamCount(n)
    }, tick)
    return () => window.clearInterval(id)
  }, [delayedRevealWaitingUi, revealDelayMs])

  useLayoutEffect(() => {
    if (aiaNpmFollowRow1Phase !== 'running') {
      const t = window.setTimeout(() => setAiaNpmFollow1StreamCount(0), AIA_CMD_EXPAND_REVEAL_MS)
      return () => window.clearTimeout(t)
    }
    const script = AIA_NPM_FOLLOW_INSTALL_STREAM_SCRIPT
    setAiaNpmFollow1StreamCount(0)
    let n = 0
    const tick = Math.max(120, Math.floor(AIA_NPM_FOLLOW_INSTALL_RUN_MS / Math.max(script.length, 1)))
    const id = window.setInterval(() => {
      n += 1
      if (n > script.length) {
        window.clearInterval(id)
        return
      }
      setAiaNpmFollow1StreamCount(n)
    }, tick)
    return () => window.clearInterval(id)
  }, [aiaNpmFollowRow1Phase])

  useLayoutEffect(() => {
    if (aiaNpmFollowRow2Phase !== 'running') {
      const t = window.setTimeout(() => setAiaNpmFollow2StreamCount(0), AIA_CMD_EXPAND_REVEAL_MS)
      return () => window.clearTimeout(t)
    }
    const script = AIA_NPM_FOLLOW_AUDIT_STREAM_SCRIPT
    setAiaNpmFollow2StreamCount(0)
    let n = 0
    const tick = Math.max(120, Math.floor(AIA_NPM_FOLLOW_AUDIT_RUN_MS / Math.max(script.length, 1)))
    const id = window.setInterval(() => {
      n += 1
      if (n > script.length) {
        window.clearInterval(id)
        return
      }
      setAiaNpmFollow2StreamCount(n)
    }, tick)
    return () => window.clearInterval(id)
  }, [aiaNpmFollowRow2Phase])

  useLayoutEffect(() => {
    if (!mcpInProgress) {
      const t = window.setTimeout(() => setMcpStreamCount(0), AIA_CMD_EXPAND_REVEAL_MS)
      return () => window.clearTimeout(t)
    }
    const script = AIA_MCP_CMD_STREAM_SCRIPT
    setMcpStreamCount(0)
    let n = 0
    const tick = Math.max(120, Math.floor(APPROVAL_IN_PROGRESS_MS / Math.max(script.length, 1)))
    const id = window.setInterval(() => {
      n += 1
      if (n > script.length) {
        window.clearInterval(id)
        return
      }
      setMcpStreamCount(n)
    }, tick)
    return () => window.clearInterval(id)
  }, [mcpInProgress])

  useLayoutEffect(() => {
    if (showApprovalChoicesUi) {
      const composer = composerRef.current
      const nonempty = Boolean(composer?.value?.trim())
      setComposerHasDraft(nonempty)

      if (!nonempty) {
        approvalOptionButtonRefs.current[approvalFocusIndex]?.focus()
        queueMicrotask(syncApprovalOptionDomFocus)
        return
      }

      if (document.activeElement === composer) {
        queueMicrotask(syncApprovalOptionDomFocus)
        return
      }

      approvalOptionButtonRefs.current[approvalFocusIndex]?.focus()
      queueMicrotask(syncApprovalOptionDomFocus)
      return
    }

    if (showMcpApprovalChoicesUi) {
      const composer = composerRef.current
      const nonempty = Boolean(composer?.value?.trim())
      setComposerHasDraft(nonempty)

      if (!nonempty) {
        mcpOptionButtonRefs.current[mcpFocusIndex]?.focus()
        queueMicrotask(syncMcpApprovalOptionDomFocus)
        return
      }

      if (document.activeElement === composer) {
        queueMicrotask(syncMcpApprovalOptionDomFocus)
        return
      }

      mcpOptionButtonRefs.current[mcpFocusIndex]?.focus()
      queueMicrotask(syncMcpApprovalOptionDomFocus)
    }
  }, [
    showApprovalChoicesUi,
    showMcpApprovalChoicesUi,
    approvalFocusIndex,
    mcpFocusIndex,
    syncApprovalOptionDomFocus,
    syncMcpApprovalOptionDomFocus,
  ])

  const submitRejectionFeedback = useCallback(() => {
    if (!awaitingRejectionFeedback) return
    const composer = composerRef.current
    const text = composer?.value.trim() ?? ''
    if (!text) return
    setRejectionFeedbackMessage(text)
    if (composer) composer.value = ''
    setComposerHasDraft(false)
    if (approvalRejected) {
      setApprovalCompleted(true)
    }
    if (mcpApprovalRejected) {
      setMcpCompleted(true)
    }
  }, [awaitingRejectionFeedback, approvalRejected, mcpApprovalRejected])

  const onComposerKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (!awaitingRejectionFeedback || event.key !== 'Enter' || event.shiftKey) return
      event.preventDefault()
      submitRejectionFeedback()
    },
    [awaitingRejectionFeedback, submitRejectionFeedback],
  )

  useLayoutEffect(() => {
    if (!awaitingRejectionFeedback) return
    queueMicrotask(() => {
      composerRef.current?.focus({ preventScroll: true })
      scrollChatToBottom({ force: true })
    })
  }, [awaitingRejectionFeedback, scrollChatToBottom])

  const handleRootPointerDownCapture = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!showApprovalChoicesUi && !showMcpApprovalChoicesUi) return
      updatePointerInChatExcludingComposer(e.clientX, e.clientY)
      const el = e.target
      if (!(el instanceof Element) || !rootRef.current?.contains(el)) return
      if (el.closest('.figma-ai-tw__inputSection')) return
      if (el.closest('button, a, textarea, input, select, [role="option"]')) return

      /* Focus the feed surface so ArrowUp/Down keydown target stays inside the tool window. */
      if (el.closest('.figma-ai-tw__feed')) {
        if (!el.closest('button, a, textarea, input, select, [role="option"]')) {
          queueMicrotask(() => feedRef.current?.focus({ preventScroll: true }))
        }
        return
      }

      if (showApprovalChoicesUi) {
        setApprovalFocusIndex(0)
        queueMicrotask(() => approvalOptionButtonRefs.current[0]?.focus())
      } else {
        setMcpFocusIndex(0)
        queueMicrotask(() => mcpOptionButtonRefs.current[0]?.focus())
      }
    },
    [
      showApprovalChoicesUi,
      showMcpApprovalChoicesUi,
      updatePointerInChatExcludingComposer,
    ],
  )

  useEffect(() => {
    if (!showApprovalChoicesUi && !showMcpApprovalChoicesUi) return
    const root = rootRef.current
    const onKeyDown = (e: KeyboardEvent) => {
      const activeApproval: 'npm' | 'mcp' | null = showApprovalChoicesUi
        ? 'npm'
        : showMcpApprovalChoicesUi
          ? 'mcp'
          : null

      if (
        e.altKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3')
      ) {
        if (!activeApproval || npmApprovalInComposer || mcpApprovalInComposer) return
        e.preventDefault()
        e.stopPropagation()
        const idx = e.code === 'Digit1' ? 0 : e.code === 'Digit2' ? 1 : 2
        if (activeApproval === 'npm') confirmApproval(idx, 'shortcut')
        else confirmMcpApproval(idx, 'shortcut')
        return
      }

      const t = e.target
      if (!(t instanceof Node) || !root?.contains(t)) return

      const composer = composerRef.current

      if (composer && t === composer) {
        if (e.key === 'ArrowUp' && composer.selectionStart === 0 && composer.selectionEnd === 0) {
          e.preventDefault()
          e.stopPropagation()
          if (activeApproval === 'npm') {
            const idx = approvalFocusIndexRef.current
            queueMicrotask(() => approvalOptionButtonRefs.current[idx]?.focus())
          } else if (activeApproval === 'mcp') {
            const idx = mcpFocusIndexRef.current
            queueMicrotask(() => mcpOptionButtonRefs.current[idx]?.focus())
          }
        }
        return
      }

      if (e.key === 'Escape' && (npmApprovalInComposer || mcpApprovalInComposer)) {
        e.preventDefault()
        e.stopPropagation()
        if (activeApproval === 'npm') dismissApproval()
        else if (activeApproval === 'mcp') dismissMcpApproval()
        return
      }

      if (e.key === 'ArrowDown') {
        if (!activeApproval) return
        e.preventDefault()
        e.stopPropagation()
        const inComposerDock = npmApprovalInComposer || mcpApprovalInComposer
        const skipBtn = composerPermissionSkipRef.current
        const submitBtn = composerPermissionSubmitRef.current
        if (inComposerDock && skipBtn && document.activeElement === skipBtn) {
          submitBtn?.focus()
          return
        }
        if (inComposerDock && submitBtn && document.activeElement === submitBtn) {
          composer?.focus()
          return
        }
        if (activeApproval === 'npm') {
          const i = approvalFocusIndexRef.current
          if (i < APPROVAL_LAST_INDEX) setApprovalFocusIndex(i + 1)
          else if (inComposerDock && skipBtn) skipBtn.focus()
          else composer?.focus()
        } else {
          const i = mcpFocusIndexRef.current
          if (i < MCP_APPROVAL_LAST_INDEX) setMcpFocusIndex(i + 1)
          else if (inComposerDock && skipBtn) skipBtn.focus()
          else composer?.focus()
        }
        return
      }

      if (e.key === 'ArrowUp') {
        if (!activeApproval) return
        e.preventDefault()
        e.stopPropagation()
        const inComposerDock = npmApprovalInComposer || mcpApprovalInComposer
        const skipBtn = composerPermissionSkipRef.current
        const submitBtn = composerPermissionSubmitRef.current
        if (
          inComposerDock &&
          skipBtn &&
          document.activeElement === skipBtn
        ) {
          if (activeApproval === 'npm') {
            setApprovalFocusIndex(APPROVAL_LAST_INDEX)
            queueMicrotask(() =>
              approvalOptionButtonRefs.current[APPROVAL_LAST_INDEX]?.focus(),
            )
          } else {
            setMcpFocusIndex(MCP_APPROVAL_LAST_INDEX)
            queueMicrotask(() => mcpOptionButtonRefs.current[MCP_APPROVAL_LAST_INDEX]?.focus())
          }
          return
        }
        if (
          inComposerDock &&
          submitBtn &&
          document.activeElement === submitBtn
        ) {
          skipBtn?.focus()
          return
        }
        if (activeApproval === 'npm') {
          const i = approvalFocusIndexRef.current
          if (i > 0) setApprovalFocusIndex(i - 1)
        } else {
          const i = mcpFocusIndexRef.current
          if (i > 0) setMcpFocusIndex(i - 1)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [
    figmaAiVariant,
    showApprovalChoicesUi,
    showMcpApprovalChoicesUi,
    confirmApproval,
    confirmMcpApproval,
    dismissApproval,
    dismissMcpApproval,
    npmApprovalInComposer,
    mcpApprovalInComposer,
  ])

  const composerTrailingShowsStop =
    figmaAiVariant === 'thinkingWgToolcalls' && thinkingWgComposerTrailing === 'stop'

  const mixedCpTraceKey = thinkingWgMixedCpTraceStyle ?? 'default'
  const cpTimelineSpineKey = thinkingWgCpTimelineSpine ? 'tls' : 'noTls'
  const mixedExpandRailKey = thinkingWgMixedExpandRailVariant
  const mixedLast3IconsKey = thinkingWgMixedLast3WithStepIcons ? 'L3i' : 'L3'
  const mixedCpFullPageKey = thinkingWgMixedCpFullPage ? 'fp' : 'noFp'

  if (isolateAiBlockOnly && figmaAiVariant === 'thinkingWgToolcalls') {
    return (
      <div
        ref={rootRef}
        className="figma-ai-tw figma-ai-tw--isolateAiBlock"
        data-figma-node="1:2525"
        onPointerDownCapture={handleRootPointerDownCapture}
      >
        <div ref={scrollRef} className="figma-ai-tw__scroll figma-ai-tw__scroll--isolateAiBlock">
          <div ref={feedRef} className="figma-ai-tw__feed figma-ai-tw__feed--isolateAiBlock" tabIndex={-1}>
            <div className="figma-ai-tw__aiBlock">
              <AiaToolwindowFeedScrollProvider
                scrollRef={scrollRef}
                suppressFeedScrollPinUntilRef={suppressFeedScrollPinUntilRef}
              >
                <ThinkingWgToolcallsPanel
                  key={`${thinkingWgToolcallsMode}-${thinkingWgPanelKind}-${thinkingWgPanelKey}-${mixedCpTraceKey}-${cpTimelineSpineKey}-${mixedExpandRailKey}-${mixedLast3IconsKey}-${mixedCpFullPageKey}`}
                  demoMode={thinkingWgToolcallsMode}
                  demoControl={thinkingWgDemoControl}
                  panelKind={thinkingWgPanelKind}
                  onComposerTrailingActionVisual={setThinkingWgComposerTrailing}
                  mixedCpTraceStyle={thinkingWgMixedCpTraceStyle ?? 'default'}
                  cpTimelineSpine={thinkingWgCpTimelineSpine}
                  mixedExpandRailVariant={thinkingWgMixedExpandRailVariant}
                  mixedLast3WithStepIcons={thinkingWgMixedLast3WithStepIcons}
                  mixedCpFullPage={thinkingWgMixedCpFullPage}
                />
              </AiaToolwindowFeedScrollProvider>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={[
        'figma-ai-tw',
        composerShowsApprovalDock ? 'figma-ai-tw--approvalInComposer' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-figma-node="1:2525"
      onPointerDownCapture={handleRootPointerDownCapture}
    >
      <header className="figma-ai-tw__header">
        <p className="figma-ai-tw__headerLabel">AI Chat</p>
        <div className="figma-ai-tw__headerIcons">
          <button type="button" className="figma-ai-tw__newChat">
            <span className="figma-ai-tw__icon16">
              <IconImg src={ideIcons.addDark} alt="" />
            </span>
            New Chat
          </button>
          <button type="button" className="figma-ai-tw__iconHit" title="History">
            <span className="figma-ai-tw__icon16">
              <IconImg src={ideIcons.history} alt="" />
            </span>
          </button>
          <button type="button" className="figma-ai-tw__iconHit" title="More">
            <span className="figma-ai-tw__icon16">
              <IconImg src={ideIcons.moreVertical} alt="" />
            </span>
          </button>
          <button type="button" className="figma-ai-tw__iconHit" title="Hide">
            <span className="figma-ai-tw__icon16">
              <IconImg src={ideIcons.hide} alt="" />
            </span>
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="figma-ai-tw__scroll">
        <div ref={feedRef} className="figma-ai-tw__feed" tabIndex={-1}>
          <div className="figma-ai-tw__userWrap">
            <div className="figma-ai-tw__userRow">
              <p className="figma-ai-tw__userText">
                {figmaAiVariant === 'agenticVcs'
                  ? 'Add centralized request logging and keep the generated changes easy to review separately from my local edits.'
                  : 'I need to add request logging to our Java application. All incoming HTTP requests should log method, path, and execution time. Use Spring Boot'}
              </p>
              <button type="button" className="figma-ai-tw__iconHit" title="Message actions">
                <span className="figma-ai-tw__icon16">
                  <IconImg src={ideIcons.moreVertical} alt="" />
                </span>
              </button>
            </div>
          </div>

          <div className="figma-ai-tw__aiBlock">
            {figmaAiVariant === 'thinkingWgToolcalls' ? (
              <AiaToolwindowFeedScrollProvider
                scrollRef={scrollRef}
                suppressFeedScrollPinUntilRef={suppressFeedScrollPinUntilRef}
              >
                <ThinkingWgToolcallsPanel
                  key={`${thinkingWgToolcallsMode}-${thinkingWgPanelKind}-${thinkingWgPanelKey}-${mixedCpTraceKey}-${cpTimelineSpineKey}-${mixedExpandRailKey}-${mixedLast3IconsKey}-${mixedCpFullPageKey}`}
                  demoMode={thinkingWgToolcallsMode}
                  demoControl={thinkingWgDemoControl}
                  panelKind={thinkingWgPanelKind}
                  onComposerTrailingActionVisual={setThinkingWgComposerTrailing}
                  mixedCpTraceStyle={thinkingWgMixedCpTraceStyle ?? 'default'}
                  cpTimelineSpine={thinkingWgCpTimelineSpine}
                  mixedExpandRailVariant={thinkingWgMixedExpandRailVariant}
                  mixedLast3WithStepIcons={thinkingWgMixedLast3WithStepIcons}
                  mixedCpFullPage={thinkingWgMixedCpFullPage}
                />
              </AiaToolwindowFeedScrollProvider>
            ) : figmaAiVariant === 'agenticVcs' ? (
              <AgenticVcsAiBlock onReviewInVcs={onReviewInVcs} />
            ) : (
              <>
                <p className="figma-ai-tw__paragraph">
                  I’ve implemented centralized request logging using a servlet filter, so the behavior is applied
                  consistently across the entire application without modifying any controllers.
                </p>
                <p className="figma-ai-tw__paragraph">
                  The filter measures request execution time, captures the HTTP method and request URI, and logs the
                  response status once the request has been processed. This approach keeps logging concerns separate
                  from business logic and makes it easy to extend or fine-tune later.
                </p>

                <div className="figma-ai-tw__aiaDefaultSnippets">
                  <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
                    <div
                      className={[
                        'figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd',
                        delayedRevealWaitingUi ? 'figma-ai-tw__snippet--aiaRanWaiting' : '',
                        !delayedRevealWaitingUi ? 'figma-ai-tw__snippet--aiaCmdCompleted' : '',
                        aiaFirstCmdLogExpanded ? 'figma-ai-tw__snippet--aiaCmdLogExpanded' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-busy={delayedRevealWaitingUi ? true : undefined}
                    >
                      <div className="figma-ai-tw__snippetHeader">
                        <AiaExpandableCmdSnippetLeft
                          onExpandToggle={toggleFirstCmdLog}
                          logExpanded={aiaFirstCmdLogExpanded}
                          expandLogId="fa-aia-cmd-log-first"
                        >
                          <span className="figma-ai-tw__snippetIcon">
                            <IconTerminal />
                          </span>
                          <AiaSnippetCmdLine
                            className={[
                              'figma-ai-tw__snippetCmd figma-ai-tw__snippetCmd--aiaFirstRowCmdEllipsis',
                              delayedRevealWaitingUi ? 'figma-ai-tw__snippetCmd--aiaLoading' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            mono={AIA_DEFAULT_FIRST_CMD_MONO}
                            highlight={AIA_CMD_HIGHLIGHT_SED}
                          >
                            <span className="m">{AIA_DEFAULT_FIRST_CMD_MONO}</span>
                          </AiaSnippetCmdLine>
                        </AiaExpandableCmdSnippetLeft>
                        <div className="figma-ai-tw__snippetRight">
                          <AiaDefaultSnippetActions
                            completed={!delayedRevealWaitingUi}
                            inProgress={delayedRevealWaitingUi}
                            logExpanded={aiaFirstCmdLogExpanded}
                            onExpandToggle={toggleFirstCmdLog}
                            expandLogId="fa-aia-cmd-log-first"
                            onOpenInTab={
                              onOpenCommandInEditorTab
                                ? () => onOpenCommandInEditorTab('sed')
                                : undefined
                            }
                          />
                        </div>
                      </div>
                      <AiaCmdExpandReveal open={delayedRevealWaitingUi && !aiaFirstCmdLogExpanded}>
                        <AiaCmdLogTail
                          id="fa-aia-cmd-log-first-wait"
                          lines={AIA_FIRST_ROW_WAIT_STREAM_LINES.slice(0, firstRowStreamCount)}
                          expanded={false}
                          compactStream
                          onCompactExpand={openFirstCmdLogFromCompact}
                          ariaLabel="Command output"
                        />
                      </AiaCmdExpandReveal>
                      <AiaCmdExpandReveal open={aiaFirstCmdLogExpanded}>
                        {aiaFirstCmdLogExpanded ? (
                          <AiaCmdLogTail
                            id="fa-aia-cmd-log-first"
                            lines={AIA_FIRST_CMD_LOG_LINES}
                            expanded
                            ariaLabel="sed command output"
                            command={AIA_CMD_HIGHLIGHT_SED}
                            commandCopyText={AIA_DEFAULT_FIRST_CMD_MONO}
                          />
                        ) : null}
                      </AiaCmdExpandReveal>
                      <div className="figma-ai-tw__snippetOutline" aria-hidden />
                    </div>
                  </div>

                  {showRunApprovalSnippetUi && !aiaComposerOnlyPermissions ? (
                    <AiaCmdBridgeParagraph>{AIA_CMD_BRIDGE_AFTER_SED}</AiaCmdBridgeParagraph>
                  ) : null}

                  {showNpmSnippetInFeed ? (
                    <>
                      <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
                      <div
                        className={[
                          'figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd',
                          approvalRejected ? 'figma-ai-tw__snippet--aiaCmdRejected' : '',
                          !approvalRejected && showApprovalChoicesUi ? 'figma-ai-tw__snippet--pending' : '',
                          !approvalRejected && approvalInProgress
                            ? 'figma-ai-tw__snippet--aiaCmdInProgress'
                            : '',
                          !approvalRejected &&
                          !showApprovalChoicesUi &&
                          !approvalOpen &&
                          approvalCompleted &&
                          !approvalInProgress
                            ? 'figma-ai-tw__snippet--aiaCmdCompleted'
                            : '',
                          aiaNpmCmdLogExpanded && !approvalInProgress
                            ? 'figma-ai-tw__snippet--aiaCmdLogExpanded'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-busy={approvalInProgress ? true : undefined}
                      >
                        <div className="figma-ai-tw__snippetHeader">
                          <AiaExpandableCmdSnippetLeft
                            onExpandToggle={toggleNpmCmdLog}
                            logExpanded={aiaNpmCmdLogExpanded}
                            expandLogId="fa-aia-cmd-log-npm"
                          >
                            {approvalRejected ? (
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
                              className={[
                                'figma-ai-tw__snippetCmd',
                                approvalInProgress ? 'figma-ai-tw__snippetCmd--aiaLoading' : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              mono={AIA_CMD_COPY_NPM_INIT}
                              highlight={AIA_CMD_HIGHLIGHT_NPM_INIT}
                            >
                              {approvalRejected ? (
                                <>
                                  <span className="figma-ai-tw__aiaCmdStatusLabel figma-ai-tw__aiaCmdStatusLabel--rejected">
                                    Rejected
                                  </span>
                                  <span className="figma-ai-tw__aiaCmdStatusCmd">npm init -y</span>
                                </>
                              ) : (
                                <>
                                  {!approvalInProgress &&
                                  !(approvalCompleted && !showApprovalChoicesUi) ? (
                                    <>
                                      <span>Run</span>
                                      <span className="m"> </span>
                                      <span className="m">$ </span>
                                    </>
                                  ) : null}
                                  <span className="m o">npm</span>
                                  <span className="m"> </span>
                                  <span className="m p">init -y</span>
                                </>
                              )}
                            </AiaSnippetCmdLine>
                          </AiaExpandableCmdSnippetLeft>
                          <div className="figma-ai-tw__snippetRight">
                            <AiaDefaultSnippetActions
                              completed={
                                (approvalCompleted && !showApprovalChoicesUi && !approvalInProgress) ||
                                approvalRejected
                              }
                              inProgress={approvalInProgress}
                              logExpanded={aiaNpmCmdLogExpanded}
                              onExpandToggle={toggleNpmCmdLog}
                              expandLogId="fa-aia-cmd-log-npm"
                              onOpenInTab={
                                onOpenCommandInEditorTab
                                  ? () => onOpenCommandInEditorTab('npm')
                                  : undefined
                              }
                            />
                          </div>
                        </div>
                        {approvalRejected ? (
                          <AiaCmdExpandReveal open={aiaNpmCmdLogExpanded}>
                            {aiaNpmCmdLogExpanded ? (
                              <AiaCmdLogTail
                                id="fa-aia-cmd-log-npm"
                                lines={[]}
                                expanded
                                ariaLabel="npm command rejected"
                                command={AIA_CMD_HIGHLIGHT_NPM_INIT}
                                commandCopyText={AIA_CMD_COPY_NPM_INIT}
                                feedback={
                                  <AiaCmdRejectionFeedback submittedText={rejectionFeedbackMessage} />
                                }
                              />
                            ) : null}
                          </AiaCmdExpandReveal>
                        ) : (
                          <>
                        <AiaCmdExpandReveal open={approvalInProgress && !aiaNpmCmdLogExpanded}>
                          <AiaCmdLogTail
                            id="fa-aia-cmd-log-npm"
                            lines={npmCmdLogLines}
                            expanded={false}
                            compactStream
                            onCompactExpand={openNpmCmdLogFromCompact}
                            ariaLabel="npm command output"
                          />
                        </AiaCmdExpandReveal>
                        <AiaCmdExpandReveal open={aiaNpmCmdLogExpanded}>
                          {aiaNpmCmdLogExpanded ? (
                            <AiaCmdLogTail
                              id="fa-aia-cmd-log-npm"
                              lines={npmCmdLogLines}
                              expanded
                              ariaLabel="npm command output"
                              command={AIA_CMD_HIGHLIGHT_NPM_INIT}
                              commandCopyText={AIA_CMD_COPY_NPM_INIT}
                            />
                          ) : null}
                        </AiaCmdExpandReveal>
                        <AiaCmdExpandReveal open={showApprovalChoicesUi && !npmApprovalInComposer}>
                          <div className="figma-ai-tw__snippetDetails">
                            <SnippetDetailsRequestApproval
                              setOptionButtonRef={setOptionButtonRef}
                              focusIndex={approvalFocusIndex}
                              setFocusIndex={setApprovalFocusIndex}
                              onConfirm={confirmApproval}
                              optionRowProminent={approvalOptionsProminent}
                              composerFocused={composerFocused}
                            />
                          </div>
                        </AiaCmdExpandReveal>
                          </>
                        )}
                        <div className="figma-ai-tw__snippetOutline" aria-hidden />
                      </div>
                    </div>

                      {aiaNpmFollowRow1Phase !== 'hidden' ? (
                        <AiaCmdBridgeParagraph>{AIA_CMD_BRIDGE_AFTER_NPM_INIT}</AiaCmdBridgeParagraph>
                      ) : null}

                      {aiaNpmFollowRow1Phase !== 'hidden' ? (
                        <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
                          <div
                            className={[
                              'figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd',
                              aiaNpmFollowRow1Phase === 'running'
                                ? 'figma-ai-tw__snippet--aiaCmdInProgress'
                                : '',
                              aiaNpmFollowRow1Phase === 'done'
                                ? 'figma-ai-tw__snippet--aiaCmdCompleted'
                                : '',
                              aiaNpmFollow1LogExpanded && aiaNpmFollowRow1Phase !== 'hidden'
                                ? 'figma-ai-tw__snippet--aiaCmdLogExpanded'
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            aria-busy={aiaNpmFollowRow1Phase === 'running' ? true : undefined}
                          >
                            <div className="figma-ai-tw__snippetHeader">
                              <AiaExpandableCmdSnippetLeft
                                onExpandToggle={toggleNpmFollow1Log}
                                logExpanded={aiaNpmFollow1LogExpanded}
                                expandLogId="fa-aia-cmd-log-npm-follow-install"
                              >
                                <span className="figma-ai-tw__snippetIcon">
                                  <IconTerminal />
                                </span>
                                <AiaSnippetCmdLine
                                  className={[
                                    'figma-ai-tw__snippetCmd',
                                    aiaNpmFollowRow1Phase === 'running'
                                      ? 'figma-ai-tw__snippetCmd--aiaLoading'
                                      : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                  mono={AIA_CMD_COPY_NPM_INSTALL}
                                  highlight={AIA_CMD_HIGHLIGHT_NPM_INSTALL}
                                />
                              </AiaExpandableCmdSnippetLeft>
                              <div className="figma-ai-tw__snippetRight">
                                <AiaDefaultSnippetActions
                                  completed={aiaNpmFollowRow1Phase === 'done'}
                                  inProgress={aiaNpmFollowRow1Phase === 'running'}
                                  logExpanded={aiaNpmFollow1LogExpanded}
                                  onExpandToggle={toggleNpmFollow1Log}
                                  expandLogId="fa-aia-cmd-log-npm-follow-install"
                                  onOpenInTab={
                                    onOpenCommandInEditorTab
                                      ? () => onOpenCommandInEditorTab('npmFollow1')
                                      : undefined
                                  }
                                />
                              </div>
                            </div>
                            <AiaCmdExpandReveal
                              open={
                                showNpmFollow1CmdLog &&
                                aiaNpmFollowRow1Phase === 'running' &&
                                !aiaNpmFollow1LogExpanded
                              }
                            >
                              <AiaCmdLogTail
                                id="fa-aia-cmd-log-npm-follow-install"
                                lines={npmFollow1CmdLogLines}
                                expanded={false}
                                compactStream
                                onCompactExpand={openNpmFollow1LogFromCompact}
                                ariaLabel="npm install command output"
                              />
                            </AiaCmdExpandReveal>
                            <AiaCmdExpandReveal open={aiaNpmFollow1LogExpanded}>
                              {aiaNpmFollow1LogExpanded ? (
                                <AiaCmdLogTail
                                  id="fa-aia-cmd-log-npm-follow-install"
                                  lines={npmFollow1CmdLogLines}
                                  expanded
                                  ariaLabel="npm install command output"
                                  command={AIA_CMD_HIGHLIGHT_NPM_INSTALL}
                                  commandCopyText={AIA_CMD_COPY_NPM_INSTALL}
                                />
                              ) : null}
                            </AiaCmdExpandReveal>
                          </div>
                        </div>
                      ) : null}

                      {aiaNpmFollowRow2Phase !== 'hidden' ? (
                        <AiaCmdBridgeParagraph>{AIA_CMD_BRIDGE_AFTER_NPM_INSTALL}</AiaCmdBridgeParagraph>
                      ) : null}

                      {aiaNpmFollowRow2Phase !== 'hidden' ? (
                        <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
                          <div
                            className={[
                              'figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd',
                              aiaNpmFollowRow2Phase === 'running'
                                ? 'figma-ai-tw__snippet--aiaCmdInProgress'
                                : '',
                              aiaNpmFollowRow2Phase === 'done'
                                ? 'figma-ai-tw__snippet--aiaCmdCompleted'
                                : '',
                              aiaNpmFollow2LogExpanded && aiaNpmFollowRow2Phase !== 'hidden'
                                ? 'figma-ai-tw__snippet--aiaCmdLogExpanded'
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            aria-busy={aiaNpmFollowRow2Phase === 'running' ? true : undefined}
                          >
                            <div className="figma-ai-tw__snippetHeader">
                              <AiaExpandableCmdSnippetLeft
                                onExpandToggle={toggleNpmFollow2Log}
                                logExpanded={aiaNpmFollow2LogExpanded}
                                expandLogId="fa-aia-cmd-log-npm-follow-audit"
                              >
                                <span className="figma-ai-tw__snippetIcon">
                                  <IconTerminal />
                                </span>
                                <AiaSnippetCmdLine
                                  className={[
                                    'figma-ai-tw__snippetCmd',
                                    aiaNpmFollowRow2Phase === 'running'
                                      ? 'figma-ai-tw__snippetCmd--aiaLoading'
                                      : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                  mono={AIA_CMD_COPY_NPM_AUDIT}
                                  highlight={AIA_CMD_HIGHLIGHT_NPM_AUDIT}
                                />
                              </AiaExpandableCmdSnippetLeft>
                              <div className="figma-ai-tw__snippetRight">
                                <AiaDefaultSnippetActions
                                  completed={aiaNpmFollowRow2Phase === 'done'}
                                  inProgress={aiaNpmFollowRow2Phase === 'running'}
                                  logExpanded={aiaNpmFollow2LogExpanded}
                                  onExpandToggle={toggleNpmFollow2Log}
                                  expandLogId="fa-aia-cmd-log-npm-follow-audit"
                                  onOpenInTab={
                                    onOpenCommandInEditorTab
                                      ? () => onOpenCommandInEditorTab('npmFollow2')
                                      : undefined
                                  }
                                />
                              </div>
                            </div>
                            <AiaCmdExpandReveal
                              open={
                                showNpmFollow2CmdLog &&
                                aiaNpmFollowRow2Phase === 'running' &&
                                !aiaNpmFollow2LogExpanded
                              }
                            >
                              <AiaCmdLogTail
                                id="fa-aia-cmd-log-npm-follow-audit"
                                lines={npmFollow2CmdLogLines}
                                expanded={false}
                                compactStream
                                onCompactExpand={openNpmFollow2LogFromCompact}
                                ariaLabel="npm audit command output"
                              />
                            </AiaCmdExpandReveal>
                            <AiaCmdExpandReveal open={aiaNpmFollow2LogExpanded}>
                              {aiaNpmFollow2LogExpanded ? (
                                <AiaCmdLogTail
                                  id="fa-aia-cmd-log-npm-follow-audit"
                                  lines={npmFollow2CmdLogLines}
                                  expanded
                                  ariaLabel="npm audit command output"
                                  command={AIA_CMD_HIGHLIGHT_NPM_AUDIT}
                                  commandCopyText={AIA_CMD_COPY_NPM_AUDIT}
                                />
                              ) : null}
                            </AiaCmdExpandReveal>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}

                  {showMcpSnippetInFeed ? (
                    <AiaCmdBridgeParagraph>{AIA_CMD_BRIDGE_AFTER_NPM_AUDIT}</AiaCmdBridgeParagraph>
                  ) : null}

                  {showMcpSnippetInFeed ? (
                    <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
                      <div
                        className={[
                          'figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--aiaCmdMcp',
                          mcpApprovalRejected ? 'figma-ai-tw__snippet--aiaCmdRejected' : '',
                          !mcpApprovalRejected && showMcpApprovalChoicesUi
                            ? 'figma-ai-tw__snippet--pending'
                            : '',
                          !mcpApprovalRejected && mcpInProgress
                            ? 'figma-ai-tw__snippet--aiaCmdInProgress'
                            : '',
                          !mcpApprovalRejected &&
                          !showMcpApprovalChoicesUi &&
                          !mcpApprovalOpen &&
                          mcpCompleted &&
                          !mcpInProgress
                            ? 'figma-ai-tw__snippet--aiaCmdCompleted'
                            : '',
                          aiaMcpCmdLogExpanded && !mcpInProgress
                            ? 'figma-ai-tw__snippet--aiaCmdLogExpanded'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-busy={mcpInProgress ? true : undefined}
                      >
                        <div className="figma-ai-tw__snippetHeader">
                          <AiaExpandableCmdSnippetLeft
                            className="figma-ai-tw__snippetLeft--aiaMcp"
                            onExpandToggle={toggleMcpCmdLog}
                            logExpanded={aiaMcpCmdLogExpanded}
                            expandLogId="fa-aia-cmd-log-mcp"
                          >
                            {mcpApprovalRejected ? (
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
                              <span className="figma-ai-tw__snippetIcon figma-ai-tw__snippetIcon--aiaMcpPlugin">
                                <IconMcp className="figma-ai-tw__aiaMcpIconSvg" aria-hidden />
                              </span>
                            )}
                            <AiaSnippetCmdLine
                              className={[
                                'figma-ai-tw__snippetCmd figma-ai-tw__snippetCmd--aiaMcpLine',
                                mcpInProgress ? 'figma-ai-tw__snippetCmd--aiaLoading' : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              mono={
                                mcpInProgress
                                  ? AIA_MCP_READ_FILE_LINE_IN_PROGRESS
                                  : AIA_CMD_COPY_MCP
                              }
                              highlight={mcpInProgress ? undefined : AIA_CMD_HIGHLIGHT_MCP}
                            >
                              {mcpApprovalRejected ? (
                                <>
                                  <span className="figma-ai-tw__aiaCmdStatusLabel figma-ai-tw__aiaCmdStatusLabel--rejected">
                                    Rejected
                                  </span>
                                  <span className="figma-ai-tw__aiaCmdStatusCmd">
                                    {AIA_MCP_READ_FILE_TOOL} {AIA_MCP_READ_FILE_ARGS_PREVIEW}
                                  </span>
                                </>
                              ) : mcpInProgress ? (
                                AIA_MCP_READ_FILE_LINE_IN_PROGRESS
                              ) : (
                                <>
                                  {showMcpApprovalChoicesUi ? (
                                    <>
                                      <span>Run</span>
                                      <span className="m"> </span>
                                    </>
                                  ) : null}
                                  <span className="figma-ai-tw__aiaMcpToolName">{AIA_MCP_READ_FILE_TOOL}</span>
                                  {mcpCompleted && !showMcpApprovalChoicesUi ? (
                                    <AiaHoverRichTip content={<AiaMcpReadFileJsonTooltipBody />}>
                                      <button
                                        type="button"
                                        className="figma-ai-tw__aiaMcpArgsTrigger"
                                        aria-label="Tool arguments (hover for full JSON)"
                                      >
                                        {AIA_MCP_READ_FILE_ARGS_PREVIEW}
                                      </button>
                                    </AiaHoverRichTip>
                                  ) : (
                                    <span className="figma-ai-tw__aiaMcpArgsInline">
                                      {AIA_MCP_READ_FILE_ARGS_PREVIEW}
                                    </span>
                                  )}
                                </>
                              )}
                            </AiaSnippetCmdLine>
                          </AiaExpandableCmdSnippetLeft>
                          <div className="figma-ai-tw__snippetRight">
                            <AiaDefaultSnippetActions
                              completed={
                                (mcpCompleted && !showMcpApprovalChoicesUi && !mcpInProgress) ||
                                mcpApprovalRejected
                              }
                              inProgress={mcpInProgress}
                              logExpanded={aiaMcpCmdLogExpanded}
                              onExpandToggle={toggleMcpCmdLog}
                              expandLogId="fa-aia-cmd-log-mcp"
                              onOpenInTab={
                                onOpenCommandInEditorTab
                                  ? () => onOpenCommandInEditorTab('mcp')
                                  : undefined
                              }
                            />
                          </div>
                        </div>
                        {mcpApprovalRejected ? (
                          <AiaCmdExpandReveal open={aiaMcpCmdLogExpanded}>
                            {aiaMcpCmdLogExpanded ? (
                              <AiaCmdLogTail
                                id="fa-aia-cmd-log-mcp"
                                lines={[]}
                                expanded
                                ariaLabel="MCP command rejected"
                                command={AIA_CMD_HIGHLIGHT_MCP}
                                commandCopyText={AIA_CMD_COPY_MCP}
                                feedback={
                                  <AiaCmdRejectionFeedback submittedText={rejectionFeedbackMessage} />
                                }
                              />
                            ) : null}
                          </AiaCmdExpandReveal>
                        ) : (
                          <>
                        <AiaCmdExpandReveal open={showMcpCmdLog && mcpInProgress && !aiaMcpCmdLogExpanded}>
                          <AiaCmdLogTail
                            id="fa-aia-cmd-log-mcp"
                            lines={mcpCmdLogLines}
                            expanded={false}
                            compactStream
                            onCompactExpand={openMcpCmdLogFromCompact}
                            ariaLabel="MCP tool output"
                          />
                        </AiaCmdExpandReveal>
                        <AiaCmdExpandReveal open={aiaMcpCmdLogExpanded}>
                          {aiaMcpCmdLogExpanded ? (
                            <AiaCmdLogTail
                              id="fa-aia-cmd-log-mcp"
                              lines={mcpCmdLogLines}
                              expanded
                              ariaLabel="MCP tool output"
                              command={AIA_CMD_HIGHLIGHT_MCP}
                              commandCopyText={AIA_CMD_COPY_MCP}
                            />
                          ) : null}
                        </AiaCmdExpandReveal>
                        <AiaCmdExpandReveal open={showMcpApprovalChoicesUi && !mcpApprovalInComposer}>
                          <div className="figma-ai-tw__snippetDetails">
                            <SnippetDetailsRequestApproval
                              setOptionButtonRef={setMcpOptionButtonRef}
                              focusIndex={mcpFocusIndex}
                              setFocusIndex={setMcpFocusIndex}
                              onConfirm={confirmMcpApproval}
                              optionRowProminent={mcpApprovalOptionsProminent}
                              composerFocused={composerFocused}
                              optionIds={MCP_APPROVAL_OPTION_IDS}
                              listboxAriaLabel="Allow running ijproxy.read_file?"
                            />
                          </div>
                        </AiaCmdExpandReveal>
                          </>
                        )}
                        <div className="figma-ai-tw__snippetOutline" aria-hidden />
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="figma-ai-tw__inputSection">
        {composerShowsApprovalDock ? (
          <div className="figma-ai-tw__composerApprovalDock figma-ai-tw__aiaDefaultSnippets">
            {npmApprovalInComposer ? (
              <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
                <div className="figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--pending figma-ai-tw__snippet--composerPermission">
                  <p className="figma-ai-tw__composerPermissionPrompt">
                    {AIA_COMPOSER_NPM_INIT_PERMISSION_PROMPT}
                  </p>
                  <div className="figma-ai-tw__composerPermissionCmdFace">
                    <div className="figma-ai-tw__snippetHeader">
                      <div className="figma-ai-tw__snippetLeft figma-ai-tw__snippetLeft--composerPermissionCmd">
                        <AiaComposerNpmInitPermissionCmdLine />
                      </div>
                    </div>
                  </div>
                  <div className="figma-ai-tw__snippetDetails">
                    <SnippetDetailsRequestApproval
                      setOptionButtonRef={setOptionButtonRef}
                      focusIndex={approvalFocusIndex}
                      setFocusIndex={setApprovalFocusIndex}
                      onConfirm={confirmApproval}
                      optionRowProminent={approvalOptionsProminent}
                      composerFocused={composerFocused}
                      listNavigationHint="arrows"
                    />
                  </div>
                  <ComposerPermissionSubmit
                    skipRef={(el) => {
                      composerPermissionSkipRef.current = el
                    }}
                    submitRef={(el) => {
                      composerPermissionSubmitRef.current = el
                    }}
                    onSkip={dismissApproval}
                    onSubmit={() => confirmApproval(approvalFocusIndex, 'click')}
                  />
                  <div className="figma-ai-tw__snippetOutline" aria-hidden />
                </div>
              </div>
            ) : null}
            {mcpApprovalInComposer ? (
              <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
                <div className="figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--aiaCmdMcp figma-ai-tw__snippet--pending figma-ai-tw__snippet--composerPermission">
                  <p className="figma-ai-tw__composerPermissionPrompt">
                    {AIA_COMPOSER_MCP_READ_FILE_PERMISSION_PROMPT}
                  </p>
                  <div className="figma-ai-tw__composerPermissionCmdFace">
                    <div className="figma-ai-tw__snippetHeader">
                      <div className="figma-ai-tw__snippetLeft figma-ai-tw__snippetLeft--aiaMcp figma-ai-tw__snippetLeft--composerPermissionMcp">
                        <AiaComposerMcpPermissionCmdBlock />
                      </div>
                    </div>
                  </div>
                  <div className="figma-ai-tw__snippetDetails">
                    <SnippetDetailsRequestApproval
                      setOptionButtonRef={setMcpOptionButtonRef}
                      focusIndex={mcpFocusIndex}
                      setFocusIndex={setMcpFocusIndex}
                      onConfirm={confirmMcpApproval}
                      optionRowProminent={mcpApprovalOptionsProminent}
                      composerFocused={composerFocused}
                      optionIds={MCP_APPROVAL_OPTION_IDS}
                      listboxAriaLabel="Allow running ijproxy.read_file?"
                      listNavigationHint="arrows"
                    />
                  </div>
                  <ComposerPermissionSubmit
                    skipRef={(el) => {
                      composerPermissionSkipRef.current = el
                    }}
                    submitRef={(el) => {
                      composerPermissionSubmitRef.current = el
                    }}
                    onSkip={dismissMcpApproval}
                    onSubmit={() => confirmMcpApproval(mcpFocusIndex, 'click')}
                  />
                  <div className="figma-ai-tw__snippetOutline" aria-hidden />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <div
          className={[
            'figma-ai-tw__field',
            awaitingRejectionFeedback ? 'figma-ai-tw__field--awaitingRejectionFeedback' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
            <div className="figma-ai-tw__inputTop">
              <textarea
                ref={composerRef}
                className="figma-ai-tw__composerInput"
                rows={3}
                tabIndex={
                  (showApprovalChoicesUi || showMcpApprovalChoicesUi) &&
                  !composerHasDraft &&
                  !awaitingRejectionFeedback
                    ? -1
                    : 0
                }
                placeholder={
                  awaitingRejectionFeedback
                    ? 'Provide instructions to Claude'
                    : 'Type task, use @mentions or /commands'
                }
                aria-label={awaitingRejectionFeedback ? 'Provide instructions to Claude' : 'Message'}
                onChange={(e) => setComposerHasDraft(e.target.value.trim().length > 0)}
                onKeyDown={onComposerKeyDown}
                onFocus={() => setComposerFocused(true)}
                onBlur={() => setComposerFocused(false)}
              />
            </div>
            <div className="figma-ai-tw__attachments" aria-hidden />
            <div className="figma-ai-tw__inputToolbar">
              <div className="figma-ai-tw__inputLeft">
                <button type="button" className="figma-ai-tw__iconHit" aria-label="Add">
                  <span className="figma-ai-tw__icon16">
                    <IconImg src={ideIcons.addDark} alt="" />
                  </span>
                </button>
                <button type="button" className="figma-ai-tw__dropdownFake" aria-label="Chat mode">
                  <span>Default</span>
                  <span className="figma-ai-tw__icon16 figma-ai-tw__icon16--compact">
                    <IconChevronDown />
                  </span>
                </button>
              </div>
              <div className="figma-ai-tw__inputRight">
                <button type="button" className="figma-ai-tw__iconHit" aria-label="Context">
                  <span className="figma-ai-tw__icon16">
                    <IconImg src={ideIcons.context} alt="" />
                  </span>
                </button>
                <button
                  type="button"
                  className="figma-ai-tw__iconHit"
                  aria-label={composerTrailingShowsStop ? 'Stop' : 'Send'}
                  onClick={
                    awaitingRejectionFeedback && !composerTrailingShowsStop
                      ? submitRejectionFeedback
                      : undefined
                  }
                  disabled={awaitingRejectionFeedback && !composerHasDraft}
                >
                  <span className="figma-ai-tw__icon16">
                    <IconImg
                      src={composerTrailingShowsStop ? ideIcons.inputToolbarStop : ideIcons.send}
                      alt=""
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
      </div>

      <footer className="figma-ai-tw__feedback">
          <div className="figma-ai-tw__feedbackLeft">
            <button type="button" className="figma-ai-tw__agentBtn">
              <span className="figma-ai-tw__icon16">
                <IconImg src={ideIcons.chatMode} alt="" />
              </span>
              <span className="figma-ai-tw__agentLabel">Claude Agent</span>
              <span className="figma-ai-tw__icon16 figma-ai-tw__icon16--compact">
                <IconChevronDown />
              </span>
            </button>
            <button type="button" className="figma-ai-tw__modelDd" aria-label="Model">
              <span>Sonnet 5.3</span>
              <span className="figma-ai-tw__icon16 figma-ai-tw__icon16--compact">
                <IconChevronDown />
              </span>
            </button>
          </div>
          <a className="figma-ai-tw__feedbackLink" href="https://www.jetbrains.com" target="_blank" rel="noreferrer">
            Feedback ↗
          </a>
        </footer>
    </div>
  )
}
