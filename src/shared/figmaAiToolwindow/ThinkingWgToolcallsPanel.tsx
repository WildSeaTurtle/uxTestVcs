import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent, ReactNode, RefObject, TransitionEvent } from 'react'
import IconMcp from '@icons/Snippet/Snippet Header/Snippet/mcp.svg?react'
import { ideIcons } from './ideIcons'
import {
  REASONING_BODY_PARAGRAPHS,
  MIXED_CP_REASONING_WORD_REVEAL_MS,
  REASONING_CP_PROGRESS_HEADLINE,
  REASONING_CP_THINKING_GROUP_PROGRESS_HEADLINE,
  formatReasoningCpCompletedHeadline,
  REASONING_PARAGRAPH_COUNT,
  REASONING_PARAGRAPH_REVEAL_AT_MS,
  REASONING_STREAM_MS,
  REASONING_STREAM_SECTION_HEADLINE,
  REASONING_THOUGHT_SECONDS,
  formatReasoningCpThinkingGroupCompletedHeadline,
} from './ThinkingWgReasoningConstants'
import { ThinkingWgReasoningPreviewStagger } from './ThinkingWgReasoningPreviewStagger'
import { ThinkingWgTraceAiaCmdSnippet } from './ThinkingWgTraceAiaCmdSnippet'
import {
  mixedStepDurationMs,
  WORKING_MIXED_STEPS,
  WORKING_MIXED_STEP_COUNT,
  WORKING_MIXED_STREAM_SECONDS,
  type MixedStep,
} from './ThinkingWgMixedSequence'
import { IconChevronDown } from './uiIcons'
import { SnippetIdeActivitySpinner } from './SnippetIdeActivitySpinner'
import { AIA_DEFAULT_FIRST_CMD_MONO } from './AiaTerminalDemoConstants'
import { AIA_CP_BODY_EXPAND_REVEAL_MS, useFeedExpandAnchor } from './AiaToolwindowFeedScroll'
type ShellToolcallRow = { kind: 'shell'; ok: boolean; label: string }
type McpToolcallRow = { kind: 'mcp'; ok: boolean; tool: string; args: string }
type ToolcallRow = ShellToolcallRow | McpToolcallRow

/** 11 steps — fewer failures; two MCP tool calls use the MCP row glyph. */
const READONLY_TOOLCALLS: ToolcallRow[] = [
  { kind: 'shell', ok: false, label: './mvnw spring-boot:run' },
  { kind: 'shell', ok: true, label: 'npm run dev' },
  { kind: 'shell', ok: true, label: 'rg "RequestLoggingFilter" src/main/java' },
  {
    kind: 'mcp',
    ok: true,
    tool: 'ijproxy.read_file',
    args: '{file_path: "src/main/resources/application.yml"}',
  },
  { kind: 'shell', ok: true, label: 'docker compose up -d postgres' },
  { kind: 'shell', ok: true, label: './mvnw -q -DskipTests compile' },
  {
    kind: 'mcp',
    ok: true,
    tool: 'ijproxy.search',
    args: '{pattern: "RequestLoggingFilter", path: "src/main/java"}',
  },
  { kind: 'shell', ok: false, label: 'curl -fsS http://localhost:8080/actuator/health' },
  { kind: 'shell', ok: true, label: 'git pull --rebase origin main' },
  { kind: 'shell', ok: true, label: './gradlew :server:test --tests "*.AuthTest"' },
  { kind: 'shell', ok: true, label: 'lsof -nP -iTCP:8080 | head' },
  { kind: 'shell', ok: true, label: AIA_DEFAULT_FIRST_CMD_MONO },
]

function toolcallRowDisplayLabel(row: ToolcallRow): string {
  return row.kind === 'mcp' ? `${row.tool} ${row.args}` : row.label
}

/**
 * One command “running” at a time; `runMs` per index (irregular length of load).
 * Next row starts immediately after the previous finishes (no idle gap).
 */
const RUN_MS = [1900, 2200, 1200, 2600, 1500, 1800, 1100, 2400, 1700, 1600, 1400, 2000]

/** Irregular per-step durations on each panel mount (paired with {@link mixedStepDurationMs} seed for mixed). */
function applyRunMsJitter(baseMs: number, seed: number, salt: number): number {
  let h = Math.imul(seed ^ salt, 0xcc9e2d51)
  h ^= h >>> 16
  h = Math.imul(h, 0x1b873593)
  h ^= h >>> 13
  const t = ((h >>> 0) % 1000) / 1000
  return Math.max(450, Math.round(baseMs * (0.62 + t * 0.76)))
}

/** Brief pause after the last command completes, then collapse to “Ran …”. */
const HOLD_AFTER_LAST_MS = 480

/** listReveal: inline `wgStepBox` collapse before switching to summary (auto, motion ok). */
/** Safety cap after `grid-template-rows` collapse starts — matches expanded list collapse (~260ms + margin). */
const LIST_REVEAL_BOX_COLLAPSE_MS = 400

/** Mixed #0 CP: after the trace finishes, wait this long then collapse the trace list to one summary line (peek). */
const MIXED_CP_TRACE_COLLAPSE_AFTER_DONE_MS = 480

/** Shared intro (Thinking / Working groups) — keep identical on `#0`–`#3` and current-production vs summary layouts. */
function ThinkingWgLeadParagraph() {
  return (
    <p className="figma-ai-tw__paragraph">
      The second dashboard template now renders projects as a vertical list with per-project task counts and rolled-up
      costs. Running the suite hit a missing Spring test slice import first, then <code>localhost:8080</code> was already
      bound from an earlier run, so the agent retried with narrower checks before the full test pass.
    </p>
  )
}

/** After all toolcalls: follow-up narrative lines mount in sequence (all THINKING-WG sidebar modes). */
const POST_REVEAL_FIRST_MS = 200
/** Pause between each line appearing — no translate/scale; lines mount in document flow. */
const POST_REVEAL_LINE_STEP_MS = 44

/** Follow-up copy split into short lines for sequential reveal (same wording as before). */
const POST_REVEAL_LINES: readonly ReactNode[] = [
  <>
    Once the noisy health checks and the Gradle smoke target stopped fighting for the same port, the agent pinned the
    datasource URL to the compose network alias, re-ran migrations, and the integration slice passed.
  </>,
  <>
    The failing unit was only missing <code>@AutoConfigureMockMvc</code> on the nested test config — after that, the
    suite went green end-to-end and the request logging filter showed up in access logs with millisecond timings as
    expected.
  </>,
  <>
    If you want stricter noise control, we can gate the filter behind{' '}
    <code>management.endpoint.httptrace.enabled</code> or sample 1 in N requests in production;
  </>,
  <>for now the defaults match what we discussed in the issue thread.</>,
]

/** Shown in summary-first `revealing` until the first successful command settles (`ranOk >= 1`). */
const WG_SUMMARY_PRE_OK_LABEL = 'Running commands'

/** Working Group (`mixed`): summary line after trace — commands + reasoning, no per-step counts. */
const WG_SUMMARY_MIXED_RESOLVED_LABEL = 'Ran commands and thoughts'

/** Working Group (`mixed`): summary-first busy line while the interleaved trace is still running. */
const WG_SUMMARY_MIXED_BUSY_LABEL = 'Thinking and running commands'

/** Working / #2 (`mixed` + `summaryFirst`): how often the summary row may jump to a newer command/reasoning line (may skip beats). */
const WORKING_MIXED_SUMMARY_FIRST_HUD_MS = 2600

type Phase = 'revealing' | 'summary' | 'expanded'

export type ThinkingWgToolcallsMode =
  | 'listReveal'
  | 'summaryFirst'
  | 'summaryPreview'
  | 'summaryPreviewLast3'
  | 'currentProduction'

/**
 * `reasoning` — rows show agent reasoning instead of shell commands.
 * `mixed` — Working Group: **terminal-forward** summary + the same shell commands interleaved with reasoning beats.
 */
export type ThinkingWgPanelKind = 'toolcalls' | 'reasoning' | 'mixed'

/** DialKit right panel: timed demo vs frozen storyboard frames. */
export type ThinkingWgDemoControl = 'auto' | 'empty' | 'partial' | 'full'

type WgEffState = {
  phase: Phase
  settledCount: number
  isRunning: boolean
  postRevealVisibleLines: number
  revealCommandListOpen: boolean
  peekListClosing: boolean
  expandedListClosing: boolean
  expandListHeightOpen: boolean
  /** Reasoning panel only: paragraphs visible during `revealing` (snap + live stagger). */
  reasoningParagraphsVisible?: number
}

function getSyntheticSnapshot(
  mode: ThinkingWgToolcallsMode,
  stage: Exclude<ThinkingWgDemoControl, 'auto'>,
  panelKind: ThinkingWgPanelKind,
): WgEffState {
  const lineCount = POST_REVEAL_LINES.length
  const idle: Omit<WgEffState, 'phase' | 'settledCount' | 'isRunning' | 'postRevealVisibleLines'> = {
    revealCommandListOpen: false,
    peekListClosing: false,
    expandedListClosing: false,
    expandListHeightOpen: false,
  }

  if (panelKind === 'reasoning') {
    if (stage === 'empty') {
      return {
        phase: 'revealing',
        settledCount: 0,
        isRunning: false,
        postRevealVisibleLines: 0,
        reasoningParagraphsVisible: 0,
        ...idle,
      }
    }
    if (stage === 'partial') {
      return {
        phase: 'revealing',
        settledCount: 0,
        isRunning: true,
        postRevealVisibleLines: 0,
        reasoningParagraphsVisible: Math.min(
          REASONING_PARAGRAPH_COUNT - 1,
          Math.max(1, Math.ceil(REASONING_PARAGRAPH_COUNT * 0.55)),
        ),
        ...idle,
      }
    }
    return {
      phase: 'summary',
      settledCount: 1,
      isRunning: false,
      postRevealVisibleLines: lineCount,
      reasoningParagraphsVisible: REASONING_PARAGRAPH_COUNT,
      ...idle,
    }
  }

  if (panelKind === 'mixed') {
    const totalMixed = WORKING_MIXED_STEP_COUNT
    if (stage === 'empty') {
      return {
        phase: 'revealing',
        settledCount: 0,
        isRunning: false,
        postRevealVisibleLines: 0,
        ...idle,
      }
    }
    if (stage === 'partial') {
      if (mode === 'listReveal') {
        return {
          phase: 'revealing',
          settledCount: 6,
          isRunning: true,
          postRevealVisibleLines: 0,
          ...idle,
        }
      }
      if (mode === 'summaryFirst' || mode === 'summaryPreview' || mode === 'summaryPreviewLast3') {
        return {
          phase: 'revealing',
          settledCount: 7,
          isRunning: true,
          postRevealVisibleLines: 0,
          ...idle,
        }
      }
      return {
        phase: 'revealing',
        settledCount: 6,
        isRunning: true,
        postRevealVisibleLines: 0,
        ...idle,
      }
    }
    return {
      phase: 'summary',
      settledCount: totalMixed,
      isRunning: false,
      postRevealVisibleLines: lineCount,
      ...idle,
    }
  }

  const total = READONLY_TOOLCALLS.length
  if (stage === 'empty') {
    return {
      phase: 'revealing',
      settledCount: 0,
      isRunning: false,
      postRevealVisibleLines: 0,
      ...idle,
    }
  }
  if (stage === 'partial') {
    if (mode === 'listReveal') {
      return {
        phase: 'revealing',
        settledCount: 4,
        isRunning: true,
        postRevealVisibleLines: 0,
        ...idle,
      }
    }
    if (mode === 'summaryFirst' || mode === 'summaryPreview' || mode === 'summaryPreviewLast3') {
      return {
        phase: 'revealing',
        settledCount: 5,
        isRunning: true,
        postRevealVisibleLines: 0,
        ...idle,
      }
    }
    return {
      phase: 'revealing',
      settledCount: 4,
      isRunning: true,
      postRevealVisibleLines: 0,
      ...idle,
    }
  }
  return {
    phase: 'summary',
    settledCount: total,
    isRunning: false,
    postRevealVisibleLines: lineCount,
    ...idle,
  }
}

/** #3: index of the command currently running under the summary (`null` during end hold / no active step). */
function computeSummaryPreviewCurrentIndex(
  demoMode: ThinkingWgToolcallsMode,
  summaryLocked: boolean,
  isRunning: boolean,
  settledCount: number,
  total: number,
): number | null {
  if (demoMode !== 'summaryPreview' || !summaryLocked) return null
  if (isRunning && settledCount < total) return settledCount
  return null
}

/**
 * Up to three step indices ending at the active `settledCount` row.
 * `#4` (`summaryPreviewLast3`): mixed + toolcalls. `#2` Working mixed (`summaryFirst`): same stack under the summary toggle while the trace runs.
 */
function computeSummaryPreviewLast3Indices(
  demoMode: ThinkingWgToolcallsMode,
  panelKind: ThinkingWgPanelKind,
  summaryLocked: boolean,
  isRunning: boolean,
  settledCount: number,
  total: number,
): number[] | null {
  if (!summaryLocked || !(isRunning && settledCount < total)) return null
  const useWindow =
    demoMode === 'summaryPreviewLast3' || (demoMode === 'summaryFirst' && panelKind === 'mixed')
  if (!useWindow) return null
  const cur = settledCount
  const start = Math.max(0, cur - 2)
  return Array.from({ length: cur - start + 1 }, (_, k) => start + k)
}

export type ThinkingWgMixedCpTraceStyle = 'default' | 'noIconsFailedPrefix' | 'timelineDots'

/** Expanded mixed `#thinking-wg-command-list` vertical spine: chips mask the line vs one uninterrupted gutter rail. */
export type ThinkingWgMixedExpandRailVariant = 'segmented' | 'continuous'

export type ThinkingWgToolcallsPanelProps = {
  /** Set from THINKING-WG task sidebar route — list vs collapsed-summary demo. */
  demoMode?: ThinkingWgToolcallsMode
  /** DialKit right panel storyboard (`auto` = play timed demo). */
  demoControl?: ThinkingWgDemoControl
  /** `reasoning` — reasoning-only rows; `mixed` — Working Group (terminal-forward summary + interleaved reasoning + commands). */
  panelKind?: ThinkingWgPanelKind
  /** Drives main composer trailing control: `stop` while mocked stream + post-reveal stagger run; `send` when idle. */
  onComposerTrailingActionVisual?: (visual: 'stop' | 'send') => void
  /**
   * Mixed #0 CP body only: `noIconsFailedPrefix` — no row glyphs, `failed ` prefix, slice preview up to 3 lines;
   * `timelineDots` — same text + segmented vertical rail with brain / terminal / cross on the line (Drafts V6).
   */
  mixedCpTraceStyle?: ThinkingWgMixedCpTraceStyle
  /** Thinking #0 CP only: vertical spine beside header icon + body (peek / expanded). */
  cpTimelineSpine?: boolean
  /**
   * `panelKind=mixed` expanded trace only (`#thinking-wg-command-list`).
   * `segmented` — spine through icon centers with chip mask; `continuous` — spine in left gutter, glyphs to the right of the line.
   */
  mixedExpandRailVariant?: ThinkingWgMixedExpandRailVariant
  /** Mixed `#4` (`summaryPreviewLast3`) only: show terminal icons in preview / expanded rows; reasoning stays text-only. */
  mixedLast3WithStepIcons?: boolean
  /**
   * Mixed #0 CP full-page variant: while the trace runs, interleaved rows fill the feed with no section header
   * or peek viewport; after completion, auto-collapse to the same one-line summary row as default CP.
   */
  mixedCpFullPage?: boolean
}

/** `icons/AI Message/*.svg` — succeeded / running vs failed toolcall row + feed + summary (terminal-forward). */
function WgToolcallStatusImg({ ok, className }: { ok: boolean; className?: string }) {
  return (
    <img
      className={['figma-ai-tw__wgToolcallStatusImg', className].filter(Boolean).join(' ')}
      src={ok ? ideIcons.aiMessageTerminal : ideIcons.aiMessageCross}
      alt=""
      aria-hidden
      width={16}
      height={16}
      decoding="async"
    />
  )
}

/** Done row: terminal = succeeded shell, cross = failed shell, MCP plugin = succeeded MCP. */
function WgMcpRowIcon({ className }: { className?: string }) {
  return <IconMcp className={['figma-ai-tw__wgMcpRowIcon', className].filter(Boolean).join(' ')} aria-hidden />
}

function rowStepIconFor(row: ToolcallRow) {
  if (row.kind === 'mcp') {
    return row.ok ? (
      <WgMcpRowIcon className="figma-ai-tw__wgStepGlyph" />
    ) : (
      <WgToolcallStatusImg ok={false} className="figma-ai-tw__wgStepGlyph" />
    )
  }
  return <WgToolcallStatusImg ok={row.ok} className="figma-ai-tw__wgStepGlyph" />
}

/** Done row: terminal = succeeded, cross = failed. */
function rowStepIcon(ok: boolean) {
  return <WgToolcallStatusImg ok={ok} className="figma-ai-tw__wgStepGlyph" />
}

function WgToolcallRowText({
  row,
  pending,
  summarySyncShimmer,
  emphasizeFailedPrefix,
  emphasizeRanPrefix,
}: {
  row: ToolcallRow
  pending?: boolean
  summarySyncShimmer?: boolean
  emphasizeFailedPrefix?: boolean
  emphasizeRanPrefix?: boolean
}) {
  if (row.kind === 'mcp') {
    const syncOn = Boolean(summarySyncShimmer)
    const pendingOn = Boolean(pending && !syncOn)
    const cmdClass = [
      'figma-ai-tw__wgStepTextCmd',
      pendingOn ? 'figma-ai-tw__wgStepText--pending' : '',
      syncOn ? 'figma-ai-tw__wgStepText--summarySyncShimmer' : '',
    ]
      .filter(Boolean)
      .join(' ')
    return (
      <span className={cmdClass}>
        <span className="figma-ai-tw__wgMcpToolName">{row.tool}</span>
        {' '}
        <span className="figma-ai-tw__wgMcpArgs">{row.args}</span>
      </span>
    )
  }
  return (
    <WgStepCommandLabel
      label={row.label}
      pending={pending}
      summarySyncShimmer={summarySyncShimmer}
      emphasizeFailedPrefix={emphasizeFailedPrefix}
      emphasizeRanPrefix={emphasizeRanPrefix}
    />
  )
}

/** Shell command (`mono`), reasoning (`reasoning`), or intro-style body (`body` — Inter 13 / 23, same as `.figma-ai-tw__paragraph`). */
function WgStepCommandLabel({
  label,
  pending,
  summarySyncShimmer,
  textVariant = 'mono',
  emphasizeFailedPrefix,
  emphasizeRanPrefix,
}: {
  label: string
  pending?: boolean
  /** Same gradient loader as busy summary; applied to the active mono or reasoning row when `summarySyncShimmer`. */
  summarySyncShimmer?: boolean
  textVariant?: 'mono' | 'reasoning' | 'body'
  /** Drafts V2: color the leading `failed` word (label already includes `failed `). */
  emphasizeFailedPrefix?: boolean
  /** Drafts V2: color the leading `ran` word (label already includes `ran `). */
  emphasizeRanPrefix?: boolean
}) {
  const text = label.replace(/^\$\s*/, '')
  const base =
    textVariant === 'reasoning'
      ? 'figma-ai-tw__wgStepTextReasoning'
      : textVariant === 'body'
        ? 'figma-ai-tw__wgStepTextBody'
        : 'figma-ai-tw__wgStepTextCmd'
  const pendingOn = Boolean(pending && !summarySyncShimmer)
  /** Mono + reasoning + body rows: one “active” shimmer surface when `summarySyncShimmer` (expanded mixed list / summary sync). */
  const syncOn = Boolean(
    summarySyncShimmer && (textVariant === 'mono' || textVariant === 'reasoning' || textVariant === 'body'),
  )
  const cmdClass = [
    base,
    pendingOn ? 'figma-ai-tw__wgStepText--pending' : '',
    syncOn ? 'figma-ai-tw__wgStepText--summarySyncShimmer' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (emphasizeFailedPrefix && textVariant === 'mono' && text.startsWith('failed ')) {
    const rest = text.slice('failed '.length)
    return (
      <span className={cmdClass}>
        <span className="figma-ai-tw__wgStepFailedPrefix">failed</span>
        {' '}
        {rest}
      </span>
    )
  }

  if (emphasizeRanPrefix && textVariant === 'mono' && text.startsWith('ran ')) {
    const rest = text.slice('ran '.length)
    return (
      <span className={cmdClass}>
        <span className="figma-ai-tw__wgStepRanPrefix">ran</span>
        {' '}
        {rest}
      </span>
    )
  }

  return <span className={cmdClass}>{text}</span>
}

/** Drafts V2 compact trace: `ran ` / `failed ` + command (no leading `$`). */
function toolcallTraceShellLabel(row: ToolcallRow): string {
  const text = toolcallRowDisplayLabel(row).replace(/^\$\s*/, '')
  return row.ok ? `ran ${text}` : `failed ${text}`
}

/** Same progressive rows as list-reveal: settled outcomes + optional running row (`doneNoAnim` for expanded panel). */
function wgToolcallRows(
  settledCount: number,
  isRunning: boolean,
  doneNoAnim: boolean | undefined,
  rows: ToolcallRow[],
  summarySyncShimmer?: boolean,
) {
  const doneExtra = doneNoAnim ? ' figma-ai-tw__wgStepRow--noAnim' : ''
  // Keep shimmer on one "active" row only: the latest visible command.
  const activeIndex = isRunning ? settledCount : settledCount > 0 ? settledCount - 1 : -1
  return rows.map((row, i) => {
    if (i < settledCount) {
      const settledSyncOn = Boolean(summarySyncShimmer && i === activeIndex)
      return (
        <div key={i} className={`figma-ai-tw__wgStepRow${doneExtra}`} role="listitem">
          <div className="figma-ai-tw__wgStepIconCol">{rowStepIconFor(row)}</div>
          <p className="figma-ai-tw__wgStepText">
            <WgToolcallRowText row={row} summarySyncShimmer={settledSyncOn} />
          </p>
        </div>
      )
    }
    if (isRunning && i === settledCount) {
      const runningSyncOn = Boolean(summarySyncShimmer && i === activeIndex)
      return (
        <div key={i} className="figma-ai-tw__wgStepRow figma-ai-tw__wgStepRow--running" role="listitem">
          <div className="figma-ai-tw__wgStepIconCol figma-ai-tw__wgStepIconCol--running">
            {row.kind === 'mcp' ? (
              <WgMcpRowIcon className="figma-ai-tw__wgStepGlyph" />
            ) : (
              <WgToolcallStatusImg ok className="figma-ai-tw__wgStepGlyph" />
            )}
          </div>
          <p className="figma-ai-tw__wgStepText">
            <WgToolcallRowText row={row} pending summarySyncShimmer={runningSyncOn} />
          </p>
        </div>
      )
    }
    return null
  })
}

function TwIconImg({ src, alt, title }: { src: string; alt: string; title?: string }) {
  return <img className="figma-ai-tw__iconImg" src={src} alt={alt} title={title} width={16} height={16} />
}

/** Shared `icons/Agents/reasoning.svg` for THINKING-WG reasoning rows (matches 16×16 step glyphs). */
function WgReasoningGlyph({ className }: { className?: string } = {}) {
  return (
    <img
      className={['figma-ai-tw__wgReasoningGlyph', className].filter(Boolean).join(' ')}
      src={ideIcons.reasoning}
      alt=""
      aria-hidden
      width={16}
      height={16}
      decoding="async"
    />
  )
}

function stripShellDollar(label: string) {
  return label.replace(/^\$\s*/, '')
}

/** `#2` mixed summary row: live one-line label from the active step (or last step after trace completes, before summary). */
function mixedSummaryFirstHudLine(settledCount: number, isRunning: boolean): string {
  const n = WORKING_MIXED_STEP_COUNT
  if (isRunning && settledCount < n) {
    const step = WORKING_MIXED_STEPS[settledCount]
    if (!step) return WG_SUMMARY_MIXED_BUSY_LABEL
    if (step.kind === 'reasoning') {
      return step.title.replace(/\s+/g, ' ').trim()
    }
    const row = READONLY_TOOLCALLS[step.cmdIndex]
    return row ? stripShellDollar(toolcallRowDisplayLabel(row)) : WG_SUMMARY_MIXED_BUSY_LABEL
  }
  if (!isRunning && settledCount >= n) {
    const last = WORKING_MIXED_STEPS[n - 1]
    if (!last) return WG_SUMMARY_MIXED_BUSY_LABEL
    if (last.kind === 'reasoning') {
      return last.title.replace(/\s+/g, ' ').trim()
    }
    const row = READONLY_TOOLCALLS[last.cmdIndex]
    return row ? stripShellDollar(toolcallRowDisplayLabel(row)) : WG_SUMMARY_MIXED_BUSY_LABEL
  }
  return WG_SUMMARY_MIXED_BUSY_LABEL
}

/** Muted reasoning copy — same line rhythm as `.figma-ai-tw__paragraph` (13 / 23 / -0.011em). */
function ReasoningBodyParagraphs({ visibleCount }: { visibleCount: number }) {
  const n = Math.max(0, Math.min(REASONING_PARAGRAPH_COUNT, visibleCount))
  return (
    <div className="figma-ai-tw__thinkingWgReasoningBodyStack">
      {REASONING_BODY_PARAGRAPHS.slice(0, n).map((text, i) => (
        <p key={i} className="figma-ai-tw__thinkingWgReasoningBodyPara">
          {text}
        </p>
      ))}
    </div>
  )
}

/**
 * Thinking Group while streaming: one flowing block; words appear in sequence (WG #0 CP parity).
 * New paragraphs extend the tail without restarting from the first word.
 */
function ReasoningStreamingBody({
  visibleCount,
  streaming = true,
}: {
  visibleCount: number
  streaming?: boolean
}) {
  const n = Math.max(0, Math.min(REASONING_PARAGRAPH_COUNT, visibleCount))
  const fullText = useMemo(
    () => REASONING_BODY_PARAGRAPHS.slice(0, n).join(' ').replace(/\s+/g, ' ').trim(),
    [n],
  )
  const words = useMemo(() => (fullText ? fullText.split(' ') : []), [fullText])
  const [visibleWordCount, setVisibleWordCount] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const viewport = rootRef.current?.closest('.figma-ai-tw__thinkingWgReasoningCpBodyViewport') as HTMLElement | null
    if (!viewport) return
    viewport.scrollTop = viewport.scrollHeight
  }, [visibleWordCount, n, streaming])

  useEffect(() => {
    if (!streaming) {
      setVisibleWordCount(words.length)
      return
    }
    if (words.length === 0) {
      setVisibleWordCount(0)
      return
    }
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setVisibleWordCount(words.length)
      return
    }

    setVisibleWordCount((c) => (c === 0 ? 1 : Math.min(c, words.length)))

    const id = window.setInterval(() => {
      setVisibleWordCount((c) => {
        if (c >= words.length) {
          window.clearInterval(id)
          return c
        }
        const next = c + 1
        if (next >= words.length) window.clearInterval(id)
        return next
      })
    }, MIXED_CP_REASONING_WORD_REVEAL_MS)

    return () => window.clearInterval(id)
  }, [words, streaming])

  const visibleText = streaming ? words.slice(0, visibleWordCount).join(' ') : fullText

  return (
    <div ref={rootRef} className="figma-ai-tw__thinkingWgReasoningBodyStack">
      <p className="figma-ai-tw__thinkingWgReasoningBodyPara figma-ai-tw__thinkingWgReasoningBodyPara--streamFlow">
        {visibleText}
      </p>
    </div>
  )
}

/** WG #0 CP in progress: one flowing block; words appear in sequence (wrap follows viewport width). */
function MixedCpTraceReasoningStreamParagraph({
  paraFrom,
  paraTo,
  running,
}: {
  paraFrom: number
  paraTo: number
  running?: boolean
}) {
  const fullText = useMemo(() => {
    return REASONING_BODY_PARAGRAPHS.slice(paraFrom, Math.min(paraTo, REASONING_PARAGRAPH_COUNT))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }, [paraFrom, paraTo])

  const words = useMemo(() => (fullText ? fullText.split(' ') : []), [fullText])
  const [visibleWordCount, setVisibleWordCount] = useState(running ? 0 : words.length)
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!running) return
    const viewport = rootRef.current?.closest('.figma-ai-tw__thinkingWgReasoningCpBodyViewport') as HTMLElement | null
    if (!viewport) return
    viewport.scrollTop = viewport.scrollHeight
  }, [visibleWordCount, running])

  useEffect(() => {
    if (!running) {
      setVisibleWordCount(words.length)
      return
    }
    if (words.length === 0) {
      setVisibleWordCount(0)
      return
    }
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setVisibleWordCount(words.length)
      return
    }
    setVisibleWordCount(1)
    if (words.length <= 1) return
    let shown = 1
    const id = window.setInterval(() => {
      shown += 1
      setVisibleWordCount(shown)
      if (shown >= words.length) window.clearInterval(id)
    }, MIXED_CP_REASONING_WORD_REVEAL_MS)
    return () => window.clearInterval(id)
  }, [running, words])

  return (
    <div
      ref={rootRef}
      className="figma-ai-tw__thinkingWgReasoningBodyStack figma-ai-tw__thinkingWgMixedCpTraceReasoning__paragraph"
    >
      <p className="figma-ai-tw__thinkingWgReasoningBodyPara figma-ai-tw__thinkingWgReasoningBodyPara--streamFlow">
        {running ? words.slice(0, visibleWordCount).join(' ') : fullText}
      </p>
    </div>
  )
}

/** Paragraph slice for Working Group expanded body (reasoning beat under its row). */
function ReasoningBodyParagraphSlice({ from, to, inline }: { from: number; to: number; inline?: boolean }) {
  const paras = REASONING_BODY_PARAGRAPHS.slice(from, Math.min(to, REASONING_BODY_PARAGRAPHS.length))
  return (
    <div
      className={[
        'figma-ai-tw__thinkingWgReasoningBodyStack',
        inline ? 'figma-ai-tw__thinkingWgMixedCpTraceReasoning__paragraph' : 'figma-ai-tw__thinkingWgMixedExpandReasoningBody',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {paras.map((text, i) => (
        <p key={i} className="figma-ai-tw__thinkingWgReasoningBodyPara">
          {text}
        </p>
      ))}
    </div>
  )
}

/** First paragraph of a reasoning slice — real copy preview for Drafts V2 (multi-line clamp before expand). */
function reasoningSliceLeadParagraph(paraFrom: number, paraTo: number): string {
  const paras = REASONING_BODY_PARAGRAPHS.slice(paraFrom, Math.min(paraTo, REASONING_BODY_PARAGRAPHS.length))
  return paras[0]?.trim() ?? ''
}

type CpTraceRailVariant = 'reasoning' | 'reasoningRunning' | 'cmdOk' | 'cmdFailed' | 'cmdRunning'

function CpTraceTimelineGlyph({ variant }: { variant: CpTraceRailVariant }) {
  if (variant === 'reasoning' || variant === 'reasoningRunning') {
    return (
      <IconChevronDown className="figma-ai-tw__wgStepGlyph figma-ai-tw__cpTraceTimelineChevron" aria-hidden />
    )
  }
  const ok = variant === 'cmdOk' || variant === 'cmdRunning'
  return <WgToolcallStatusImg ok={ok} className="figma-ai-tw__wgStepGlyph" />
}

/** Variant 6: icons in a narrow column; CSS (`timelineDots`) draws one gradient spine on the list. */
function CpTraceTimelineIconRail({
  variant,
  isFirst,
  isLast,
  children,
}: {
  variant: CpTraceRailVariant
  isFirst: boolean
  isLast: boolean
  children: ReactNode
}) {
  return (
    <div className="figma-ai-tw__cpTraceTimeline">
      <div className="figma-ai-tw__cpTraceTimelineRail" aria-hidden>
        <div
          className={[
            'figma-ai-tw__cpTraceTimelineRailSeg figma-ai-tw__cpTraceTimelineRailSeg--up',
            isFirst ? 'figma-ai-tw__cpTraceTimelineRailSeg--upFirst' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="figma-ai-tw__cpTraceTimelineRailLine" />
        </div>
        <div className="figma-ai-tw__cpTraceTimelineIconSlot">
          <CpTraceTimelineGlyph variant={variant} />
        </div>
        <div
          className={[
            'figma-ai-tw__cpTraceTimelineRailSeg figma-ai-tw__cpTraceTimelineRailSeg--down',
            isLast ? 'figma-ai-tw__cpTraceTimelineRailSeg--downLast' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="figma-ai-tw__cpTraceTimelineRailLine" />
        </div>
      </div>
      <div className="figma-ai-tw__cpTraceTimelineBody">{children}</div>
    </div>
  )
}

/** Mixed #0 CP trace: reasoning row preview + expand for slice body; V2 uses first-paragraph preview up to 3 lines. */
function MixedCpTraceReasoningExpandable({
  title,
  paraFrom,
  paraTo,
  running,
  summarySyncShimmer,
  doneExtra,
  cpTraceStyle = 'default',
  traceIsFirst,
  traceIsLast,
  streamParagraph = false,
  cpPeekMode = false,
}: {
  title: string
  paraFrom: number
  paraTo: number
  running?: boolean
  summarySyncShimmer?: boolean
  doneExtra: string
  cpTraceStyle?: ThinkingWgMixedCpTraceStyle
  traceIsFirst: boolean
  traceIsLast: boolean
  /** WG #0 CP while trace runs: reasoning copy as wrapped paragraphs, not one-line titles. */
  streamParagraph?: boolean
  /** WG CP peek: row is non-interactive — shell click expands the whole section. */
  cpPeekMode?: boolean
}) {
  const bodyId = useId()
  const [expanded, setExpanded] = useState(false)
  const toggle = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setExpanded((v) => !v)
  }, [])

  const compact = cpTraceStyle !== 'default'
  const useTimeline = cpTraceStyle === 'timelineDots'
  const slicePreview = cpTraceStyle === 'noIconsFailedPrefix' ? reasoningSliceLeadParagraph(paraFrom, paraTo) : ''
  const previewLabel = slicePreview || title

  const rowClass = [
    `figma-ai-tw__wgStepRow${running ? ' figma-ai-tw__wgStepRow--running' : ''}${doneExtra}`,
    compact && !useTimeline ? 'figma-ai-tw__wgStepRow--cpTraceCompact' : '',
    useTimeline ? 'figma-ai-tw__wgStepRow--cpTraceTimeline' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const titleLineClass = [
    'figma-ai-tw__wgStepText figma-ai-tw__thinkingWgMixedCpTraceReasoning__titleLine',
    cpTraceStyle === 'noIconsFailedPrefix' ? 'figma-ai-tw__thinkingWgMixedCpTraceReasoning__titleLine--clamp3' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const titleBlock = (
    <p className={titleLineClass}>
      <WgStepCommandLabel
        label={previewLabel}
        textVariant="reasoning"
        pending={running}
        summarySyncShimmer={summarySyncShimmer}
      />
    </p>
  )

  const paragraphBlock = (
    <MixedCpTraceReasoningStreamParagraph paraFrom={paraFrom} paraTo={paraTo} running={running} />
  )

  const buildTitleRow = (showDiscloseLead: boolean) => {
    if (streamParagraph) return paragraphBlock
    if (useTimeline) {
      return (
        <div className={rowClass}>
          <CpTraceTimelineIconRail
            variant={running ? 'reasoningRunning' : 'reasoning'}
            isFirst={traceIsFirst}
            isLast={traceIsLast}
          >
            {titleBlock}
          </CpTraceTimelineIconRail>
        </div>
      )
    }
    return (
      <div className={rowClass}>
        {!compact && showDiscloseLead ? (
          <div
            className={[
              'figma-ai-tw__wgStepIconCol figma-ai-tw__thinkingWgMixedCpTraceReasoning__lead',
              running ? 'figma-ai-tw__wgStepIconCol--running' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="figma-ai-tw__thinkingWgMixedCpTraceReasoning__leadChevron" aria-hidden>
              <IconChevronDown className="figma-ai-tw__wgStepGlyph" />
            </span>
            <WgReasoningGlyph className="figma-ai-tw__wgStepGlyph figma-ai-tw__thinkingWgMixedCpTraceReasoning__leadBrain" />
          </div>
        ) : !compact ? (
          <div className={`figma-ai-tw__wgStepIconCol${running ? ' figma-ai-tw__wgStepIconCol--running' : ''}`}>
            <WgReasoningGlyph className="figma-ai-tw__wgStepGlyph" />
          </div>
        ) : null}
        {titleBlock}
      </div>
    )
  }

  if (running || streamParagraph || cpPeekMode) {
    return (
      <div
        role="listitem"
        className={[
          'figma-ai-tw__thinkingWgMixedCpTraceReasoning',
          running ? 'figma-ai-tw__thinkingWgMixedCpTraceReasoning--running' : '',
          streamParagraph ? 'figma-ai-tw__thinkingWgMixedCpTraceReasoning--streamParagraph' : '',
          cpPeekMode ? 'figma-ai-tw__thinkingWgMixedCpTraceReasoning--cpPeek' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {buildTitleRow(false)}
      </div>
    )
  }

  return (
    <div
      role="listitem"
      className={[
        'figma-ai-tw__thinkingWgMixedCpTraceReasoning',
        expanded ? 'figma-ai-tw__thinkingWgMixedCpTraceReasoning--expanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="figma-ai-tw__thinkingWgMixedCpTraceReasoning__toggle"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
        aria-label={expanded ? `Collapse reasoning: ${title}` : `Expand reasoning: ${title}`}
      >
        {buildTitleRow(true)}
      </button>
      {expanded ? (
        <div
          id={bodyId}
          className="figma-ai-tw__thinkingWgMixedCpTraceReasoning__body"
          role="region"
          onClick={(e) => e.stopPropagation()}
        >
          <ReasoningBodyParagraphSlice from={paraFrom} to={paraTo} />
        </div>
      ) : null}
    </div>
  )
}

/** Working Group expanded list: one reasoning beat — collapsed by default; chevron discloses body in place. */
function MixedReasoningExpandableBeat({
  title,
  paraFrom,
  paraTo,
  doneNoAnim,
  defaultExpanded = false,
}: {
  title: string
  paraFrom: number
  paraTo: number
  doneNoAnim: boolean
  /** When the trace is finished and the user opens the full list, all thinking beats start expanded. */
  defaultExpanded?: boolean
}) {
  const bodyId = useId()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const toggle = useCallback(() => setExpanded((v) => !v), [])
  const rowExtra = doneNoAnim ? ' figma-ai-tw__wgStepRow--noAnim' : ''

  return (
    <div
      role="listitem"
      className={[
        'figma-ai-tw__thinkingWgMixedExpandBeat',
        expanded ? 'figma-ai-tw__thinkingWgMixedExpandBeat--expanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="figma-ai-tw__thinkingWgMixedExpandBeat__toggle"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
        aria-label={expanded ? `Collapse reasoning: ${title}` : `Expand reasoning: ${title}`}
      >
        <div className={`figma-ai-tw__wgStepRow figma-ai-tw__thinkingWgMixedExpandBeat__headerRow${rowExtra}`}>
          <div className="figma-ai-tw__wgStepIconCol figma-ai-tw__thinkingWgMixedExpandBeat__iconCol">
            <IconChevronDown className="figma-ai-tw__wgStepGlyph figma-ai-tw__thinkingWgMixedExpandBeat__disclose" aria-hidden />
          </div>
          <p className="figma-ai-tw__wgStepText">
            <WgStepCommandLabel label={title} textVariant="reasoning" />
          </p>
        </div>
      </button>
      {expanded ? (
        <div id={bodyId} className="figma-ai-tw__thinkingWgMixedExpandBeat__body" role="region">
          <ReasoningBodyParagraphSlice from={paraFrom} to={paraTo} />
        </div>
      ) : null}
    </div>
  )
}

function mixedFlatRows(
  settledCount: number,
  isRunning: boolean,
  doneNoAnim: boolean | undefined,
  summarySyncShimmer?: boolean,
  cpTraceReasoningExpandable?: boolean,
  mixedCpTraceStyle: ThinkingWgMixedCpTraceStyle = 'default',
  hideReasoningGlyphs = false,
  cpTraceInProgress = false,
  cpPeekMode = false,
) {
  const traceStyle: ThinkingWgMixedCpTraceStyle =
    cpTraceReasoningExpandable && mixedCpTraceStyle !== 'default' ? mixedCpTraceStyle : 'default'
  const textCompact = traceStyle === 'noIconsFailedPrefix' || traceStyle === 'timelineDots'
  const useTimeline = traceStyle === 'timelineDots'
  const showRowGlyphCol = traceStyle === 'default'

  const doneExtra = doneNoAnim ? ' figma-ai-tw__wgStepRow--noAnim' : ''
  const activeIndex = isRunning ? settledCount : settledCount > 0 ? settledCount - 1 : -1
  const nodes: ReactNode[] = []

  let lastVisibleIndex = -1
  if (isRunning && settledCount < WORKING_MIXED_STEPS.length) {
    lastVisibleIndex = settledCount
  } else if (settledCount > 0) {
    lastVisibleIndex = settledCount - 1
  }

  const toolRowOuterClass = (base: string) =>
    [
      base,
      textCompact && !useTimeline ? 'figma-ai-tw__wgStepRow--cpTraceCompact' : '',
      useTimeline ? 'figma-ai-tw__wgStepRow--cpTraceTimeline' : '',
    ]
      .filter(Boolean)
      .join(' ')

  for (let i = 0; i < WORKING_MIXED_STEPS.length; i++) {
    const step = WORKING_MIXED_STEPS[i]!
    if (i < settledCount) {
      if (step.kind === 'reasoning') {
        const syncOn = Boolean(summarySyncShimmer && i === activeIndex)
        if (cpTraceReasoningExpandable) {
          nodes.push(
            <MixedCpTraceReasoningExpandable
              key={i}
              title={step.title}
              paraFrom={step.paraFrom}
              paraTo={step.paraTo}
              summarySyncShimmer={syncOn}
              doneExtra={doneExtra}
              cpTraceStyle={traceStyle}
              traceIsFirst={i === 0}
              traceIsLast={i === lastVisibleIndex}
              streamParagraph={cpTraceInProgress}
              cpPeekMode={cpPeekMode}
            />,
          )
        } else {
          nodes.push(
            <div key={i} className={`figma-ai-tw__wgStepRow${doneExtra}`} role="listitem">
              {hideReasoningGlyphs ? null : (
                <div className="figma-ai-tw__wgStepIconCol">
                  <WgReasoningGlyph className="figma-ai-tw__wgStepGlyph" />
                </div>
              )}
              <p className="figma-ai-tw__wgStepText">
                <WgStepCommandLabel label={step.title} textVariant="reasoning" summarySyncShimmer={syncOn} />
              </p>
            </div>,
          )
        }
      } else {
        const row = READONLY_TOOLCALLS[step.cmdIndex]
        if (!row) continue
        if (cpTraceReasoningExpandable) {
          nodes.push(
            <ThinkingWgTraceAiaCmdSnippet key={i} row={row} stepIndex={i} allowLogExpand={!cpPeekMode} />,
          )
          continue
        }
        const syncOn = Boolean(summarySyncShimmer && i === activeIndex)
        const cmdLabel = useTimeline
          ? stripShellDollar(toolcallRowDisplayLabel(row))
          : textCompact
            ? toolcallTraceShellLabel(row)
            : toolcallRowDisplayLabel(row)
        const cmdInner = (
          <p className="figma-ai-tw__wgStepText">
            <WgToolcallRowText
              row={row}
              summarySyncShimmer={syncOn}
              emphasizeFailedPrefix={textCompact && !row.ok && !useTimeline}
              emphasizeRanPrefix={textCompact && row.ok && !useTimeline}
            />
          </p>
        )
        const wrapped = useTimeline ? (
          <CpTraceTimelineIconRail
            variant={row.ok ? 'cmdOk' : 'cmdFailed'}
            isFirst={i === 0}
            isLast={i === lastVisibleIndex}
          >
            {cmdInner}
          </CpTraceTimelineIconRail>
        ) : showRowGlyphCol ? (
          <>
            <div className="figma-ai-tw__wgStepIconCol">{rowStepIconFor(row)}</div>
            {cmdInner}
          </>
        ) : (
          cmdInner
        )
        nodes.push(
          <div key={i} className={toolRowOuterClass(`figma-ai-tw__wgStepRow${doneExtra}`)} role="listitem">
            {wrapped}
          </div>,
        )
      }
      continue
    }
    if (isRunning && i === settledCount) {
      if (step.kind === 'reasoning') {
        if (cpTraceReasoningExpandable) {
          nodes.push(
            <MixedCpTraceReasoningExpandable
              key={i}
              title={step.title}
              paraFrom={step.paraFrom}
              paraTo={step.paraTo}
              running
              summarySyncShimmer={Boolean(summarySyncShimmer)}
              doneExtra=""
              cpTraceStyle={traceStyle}
              traceIsFirst={i === 0}
              traceIsLast={i === lastVisibleIndex}
              streamParagraph={cpTraceInProgress}
            />,
          )
        } else {
          nodes.push(
            <div key={i} className={`figma-ai-tw__wgStepRow figma-ai-tw__wgStepRow--running`} role="listitem">
              {hideReasoningGlyphs ? null : (
                <div className="figma-ai-tw__wgStepIconCol figma-ai-tw__wgStepIconCol--running">
                  <WgReasoningGlyph className="figma-ai-tw__wgStepGlyph" />
                </div>
              )}
              <p className="figma-ai-tw__wgStepText">
                <WgStepCommandLabel
                  label={step.title}
                  textVariant="reasoning"
                  pending
                  summarySyncShimmer={Boolean(summarySyncShimmer)}
                />
              </p>
            </div>,
          )
        }
      } else {
        const row = READONLY_TOOLCALLS[step.cmdIndex]
        if (!row) continue
        if (cpTraceReasoningExpandable) {
          nodes.push(<ThinkingWgTraceAiaCmdSnippet key={i} row={row} stepIndex={i} running allowLogExpand={!cpPeekMode} />)
          continue
        }
        const runningSyncOn = Boolean(summarySyncShimmer && i === activeIndex)
        const cmdInner = (
          <p className="figma-ai-tw__wgStepText">
            <WgToolcallRowText row={row} pending summarySyncShimmer={runningSyncOn} />
          </p>
        )
        const wrapped = useTimeline ? (
          <CpTraceTimelineIconRail variant="cmdRunning" isFirst={i === 0} isLast={i === lastVisibleIndex}>
            {cmdInner}
          </CpTraceTimelineIconRail>
        ) : showRowGlyphCol ? (
          <>
            <div className="figma-ai-tw__wgStepIconCol figma-ai-tw__wgStepIconCol--running">
              {row.kind === 'mcp' ? (
                <WgMcpRowIcon className="figma-ai-tw__wgStepGlyph" />
              ) : (
                <WgToolcallStatusImg ok className="figma-ai-tw__wgStepGlyph" />
              )}
            </div>
            {cmdInner}
          </>
        ) : (
          cmdInner
        )
        nodes.push(
          <div
            key={i}
            className={toolRowOuterClass('figma-ai-tw__wgStepRow figma-ai-tw__wgStepRow--running')}
            role="listitem"
          >
            {wrapped}
          </div>,
        )
      }
    }
  }
  return nodes
}

function mixedExpandedDetailedRows(doneNoAnim: boolean) {
  const extra = doneNoAnim ? ' figma-ai-tw__wgStepRow--noAnim' : ''
  const out: ReactNode[] = []
  WORKING_MIXED_STEPS.forEach((step, i) => {
    if (step.kind === 'reasoning') {
      out.push(
        <MixedReasoningExpandableBeat
          key={`beat-${i}`}
          title={step.title}
          paraFrom={step.paraFrom}
          paraTo={step.paraTo}
          doneNoAnim={Boolean(doneNoAnim)}
          defaultExpanded
        />,
      )
    } else {
      const row = READONLY_TOOLCALLS[step.cmdIndex]
      if (!row) return
      out.push(
        <div key={`h-${i}`} className={`figma-ai-tw__wgStepRow${extra}`} role="listitem">
          <div className="figma-ai-tw__wgStepIconCol">{rowStepIconFor(row)}</div>
          <p className="figma-ai-tw__wgStepText">
            <WgToolcallRowText row={row} />
          </p>
        </div>,
      )
    }
  })
  return out
}

/** #0 Working Group feed card — reasoning beat: one-line header; hover shows chevron; expand for full paragraph slice. */
function ThinkingWgMixedReasoningFeedSnippet({
  title,
  paraFrom,
  paraTo,
  running,
}: {
  title: string
  paraFrom: number
  paraTo: number
  running?: boolean
}) {
  const expandBodyId = useId()
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => {
    setExpanded((v) => !v)
  }, [])

  const snippetClass = ['figma-ai-tw__snippet', running ? 'figma-ai-tw__snippet--thinkingWgRunning' : '']
    .filter(Boolean)
    .join(' ')
  const wrapClass = [
    'figma-ai-tw__snippetWrap',
    'figma-ai-tw__snippetWrap--thinkingWgFeed',
    'figma-ai-tw__snippetWrap--thinkingWgMixedReasoningFeed',
    expanded ? 'figma-ai-tw__snippetWrap--mixedReasoningExpanded' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapClass} role="listitem">
      <div className={snippetClass} aria-busy={running ? true : undefined}>
        <button
          type="button"
          className="figma-ai-tw__thinkingWgMixedReasoningFeedHeaderBtn"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-controls={expandBodyId}
          aria-label={expanded ? `Collapse reasoning: ${title}` : `Expand reasoning: ${title}`}
        >
          <div className="figma-ai-tw__snippetHeader">
            <div className="figma-ai-tw__snippetLeft">
              <span className="figma-ai-tw__thinkingWgMixedReasoningFeedLead" aria-hidden>
                <span className="figma-ai-tw__thinkingWgMixedReasoningFeedLead__chevron">
                  <IconChevronDown className="figma-ai-tw__wgStepGlyph" />
                </span>
                <span className="figma-ai-tw__thinkingWgMixedReasoningFeedLead__glyph">
                  <WgReasoningGlyph className="figma-ai-tw__wgStepGlyph" />
                </span>
              </span>
              <div className="figma-ai-tw__snippetCmd figma-ai-tw__snippetCmd--thinkingWgMixedReasoning">
                <p className="figma-ai-tw__thinkingWgMixedFeedTitle">{title}</p>
              </div>
            </div>
          </div>
        </button>
        {expanded ? (
          <div id={expandBodyId} className="figma-ai-tw__thinkingWgMixedReasoningFeedExpand" role="region">
            <ReasoningBodyParagraphSlice from={paraFrom} to={paraTo} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

/**
 * #0 reasoning / mixed CP: top scrim (`BodyShell::after`) only when the viewport is scrolled
 * so copy runs under the fade — not while `scrollTop` is 0 (no overlap at the top edge).
 */
function useReasoningCpViewportTopScrim(viewportRef: RefObject<HTMLDivElement | null>) {
  const [showTopScrim, setShowTopScrim] = useState(false)

  const syncTopScrim = useCallback(() => {
    const el = viewportRef.current
    if (!el) {
      setShowTopScrim(false)
      return
    }
    const overflow = el.scrollHeight > el.clientHeight + 1
    const scrolled = el.scrollTop > 2
    setShowTopScrim(overflow && scrolled)
  }, [viewportRef])

  return { showTopScrim, syncTopScrim }
}

/** #0 Working Group current-production: one collapsed snippet (parity with Thinking Group reasoning #0 CP). */
function ThinkingWgMixedCurrentProductionStream({
  phase,
  settledCount,
  isRunning,
  allDone,
  mixedCpTraceStyle = 'default',
  mixedCpFullPage = false,
}: {
  phase: Phase
  settledCount: number
  isRunning: boolean
  allDone: boolean
  mixedCpTraceStyle?: ThinkingWgMixedCpTraceStyle
  mixedCpFullPage?: boolean
}) {
  const bodyScrollRef = useRef<HTMLDivElement>(null)
  const { showTopScrim, syncTopScrim } = useReasoningCpViewportTopScrim(bodyScrollRef)
  const [cpExpanded, setCpExpanded] = useState(false)
  const anchorToggle = useFeedExpandAnchor(AIA_CP_BODY_EXPAND_REVEAL_MS)
  const onCpHeaderClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      anchorToggle(event, () => setCpExpanded((v) => !v))
    },
    [anchorToggle],
  )

  const mixedTraceComplete = settledCount >= WORKING_MIXED_STEP_COUNT && !isRunning
  const [mixedTraceCollapsed, setMixedTraceCollapsed] = useState(false)

  /** Trace finished and auto-collapsed: single header row, no body / duplicate summary line. */
  const mixedFinalHeadlineOnly = mixedTraceCollapsed && !cpExpanded
  const showMixedCpBody = !mixedFinalHeadlineOnly

  const onCpPeekExpand = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (cpExpanded || !showMixedCpBody) return
      const header = event.currentTarget
        .closest('.figma-ai-tw__snippet')
        ?.querySelector('.figma-ai-tw__snippetHeader') as HTMLElement | null
      anchorToggle(event, () => setCpExpanded(true), header)
    },
    [anchorToggle, cpExpanded, showMixedCpBody],
  )

  useEffect(() => {
    if (!mixedTraceComplete) {
      setMixedTraceCollapsed(false)
      return
    }
    if (cpExpanded) return
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delay = reduce ? 0 : MIXED_CP_TRACE_COLLAPSE_AFTER_DONE_MS
    const t = window.setTimeout(() => setMixedTraceCollapsed(true), delay)
    return () => window.clearTimeout(t)
  }, [mixedTraceComplete, cpExpanded])

  /** CP card: “Working” while the mixed trace runs; after completion → “Worked”. */
  const cpStreaming = phase === 'revealing' && isRunning
  const cpHeadlineDone = formatReasoningCpCompletedHeadline(WORKING_MIXED_STREAM_SECONDS)

  useLayoutEffect(() => {
    if (!showMixedCpBody || cpExpanded) return
    const el = bodyScrollRef.current
    if (!el) return
    if (mixedTraceCollapsed) {
      el.scrollTop = 0
    } else {
      el.scrollTop = el.scrollHeight
    }
    syncTopScrim()
  }, [settledCount, isRunning, phase, cpExpanded, mixedTraceCollapsed, syncTopScrim, showMixedCpBody])

  useEffect(() => {
    if (!showMixedCpBody || cpExpanded) return
    const el = bodyScrollRef.current
    if (!el) return
    syncTopScrim()
    el.addEventListener('scroll', syncTopScrim, { passive: true })
    const ro = new ResizeObserver(() => syncTopScrim())
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', syncTopScrim)
      ro.disconnect()
    }
  }, [syncTopScrim, settledCount, isRunning, phase, cpExpanded, allDone, showMixedCpBody])

  const titleInner = mixedFinalHeadlineOnly
    ? cpHeadlineDone
    : cpStreaming
      ? (
          <span className="figma-ai-tw__thinkingWgReasoningHeadTitleBusy">{REASONING_CP_PROGRESS_HEADLINE}</span>
        )
      : (
          cpHeadlineDone
        )

  const headTitle = <span className="figma-ai-tw__thinkingWgReasoningHeadTitle">{titleInner}</span>

  const headerVoiceDone = cpHeadlineDone

  const head = (
    <div
      className={[
        'figma-ai-tw__thinkingWgReasoningHead figma-ai-tw__thinkingWgReasoningHead--cp',
        mixedFinalHeadlineOnly
          ? 'figma-ai-tw__thinkingWgReasoningHead--mixedCpFinalLine'
          : 'figma-ai-tw__thinkingWgReasoningHead--mixedCpChevronLead',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="figma-ai-tw__thinkingWgReasoningCpLead" aria-hidden>
        <span className="figma-ai-tw__thinkingWgReasoningCpLead__chevron">
          <IconChevronDown className="figma-ai-tw__wgStepGlyph" />
        </span>
      </span>
      {headTitle}
    </div>
  )

  const traceRows = mixedFlatRows(
    settledCount,
    isRunning,
    false,
    Boolean(phase === 'revealing' && !allDone),
    true,
    mixedCpTraceStyle,
    false,
    cpStreaming,
    !cpExpanded && showMixedCpBody && !mixedCpFullPage,
  )

  /** Full-page CP: flat interleaved trace in the feed until auto-collapse; then same one-line summary card. */
  const showFullPageFlat = mixedCpFullPage && !mixedTraceCollapsed

  if (showFullPageFlat) {
    return (
      <div
        className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--thinkingWgFeed figma-ai-tw__snippetWrap--thinkingWgMixedCpFullPage"
        aria-busy={cpStreaming ? true : undefined}
      >
        <div
          className={[
            'figma-ai-tw__thinkingWgFeedList',
            'figma-ai-tw__thinkingWgMixedCpTraceList',
            'figma-ai-tw__thinkingWgMixedCpTraceList--aiaCmdTrace',
            'figma-ai-tw__thinkingWgMixedCpFullPageTrace',
          ]
            .filter(Boolean)
            .join(' ')}
          role="list"
          aria-label="Reasoning and command trace"
          {...(mixedCpTraceStyle !== 'default' ? { 'data-cp-trace-style': mixedCpTraceStyle } : {})}
        >
          {traceRows}
        </div>
      </div>
    )
  }

  return (
    <div
      className={[
        'figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--thinkingWgFeed figma-ai-tw__snippetWrap--thinkingWgReasoningCp figma-ai-tw__snippetWrap--thinkingWgMixedCp',
        mixedCpFullPage ? 'figma-ai-tw__snippetWrap--thinkingWgMixedCpFullPageCollapsed' : '',
        cpExpanded ? 'figma-ai-tw__snippetWrap--reasoningCpExpanded' : '',
        mixedFinalHeadlineOnly ? 'figma-ai-tw__snippetWrap--reasoningCpHeadOnly' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={`figma-ai-tw__snippet figma-ai-tw__snippet--thinkingWgReasoningCp${cpStreaming ? ' figma-ai-tw__snippet--thinkingWgRunning' : ''}${cpExpanded ? ' figma-ai-tw__snippet--thinkingWgReasoningCpExpanded' : ''}${!showMixedCpBody ? ' figma-ai-tw__snippet--thinkingWgReasoningCpHeadOnly' : ''}`}
        aria-busy={cpStreaming ? true : undefined}
      >
        <div className="figma-ai-tw__snippetHeader">
          <button
            type="button"
            className="figma-ai-tw__thinkingWgReasoningCpHeaderBtn"
            aria-expanded={cpExpanded}
            aria-controls="thinking-wg-mixed-cp-body"
            aria-label={
              cpExpanded
                ? `Collapse reasoning and commands: ${cpStreaming ? REASONING_CP_PROGRESS_HEADLINE : headerVoiceDone}`
                : `Expand reasoning and commands: ${cpStreaming ? REASONING_CP_PROGRESS_HEADLINE : headerVoiceDone}`
            }
            onClick={onCpHeaderClick}
          >
            <span className="figma-ai-tw__snippetLeft figma-ai-tw__snippetLeft--reasoningCp">{head}</span>
          </button>
        </div>
        <div
          className={[
            'figma-ai-tw__thinkingWgReasoningCpBodyReveal',
            showMixedCpBody ? 'figma-ai-tw__thinkingWgReasoningCpBodyReveal--open' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={!showMixedCpBody}
        >
          <div
            className="figma-ai-tw__thinkingWgReasoningCpBodyRevealInner"
            {...(!showMixedCpBody ? { inert: true } : {})}
          >
            <div
              className={[
                'figma-ai-tw__thinkingWgReasoningCpBodyShell',
                cpExpanded ? '' : 'figma-ai-tw__thinkingWgReasoningCpBodyShell--peek',
                showTopScrim ? 'figma-ai-tw__thinkingWgReasoningCpBodyShell--topScrim' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={cpExpanded || !showMixedCpBody ? undefined : onCpPeekExpand}
            >
              <div id="thinking-wg-mixed-cp-body" ref={bodyScrollRef} className="figma-ai-tw__thinkingWgReasoningCpBodyViewport">
                <div className="figma-ai-tw__thinkingWgMixedCpTraceMount">
                  <div
                    className="figma-ai-tw__thinkingWgFeedList figma-ai-tw__thinkingWgMixedCpTraceList figma-ai-tw__thinkingWgMixedCpTraceList--aiaCmdTrace"
                    role="list"
                    aria-label="Reasoning and command trace"
                    {...(mixedCpTraceStyle !== 'default' ? { 'data-cp-trace-style': mixedCpTraceStyle } : {})}
                  >
                    {traceRows}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="figma-ai-tw__snippetOutline" aria-hidden />
      </div>
    </div>
  )
}

/** Must match `--tw-last3-lh` + `--tw-last3-gap` in `FigmaAiToolwindow.css` (summary icon row = 16px + 8px gap → text @ 24px). */
const LAST3_LINE_PX = 23
const LAST3_GAP_PX = 2
const LAST3_STRIDE_PX = LAST3_LINE_PX + LAST3_GAP_PX

function shouldSlideLast3Window(prev: readonly number[], next: readonly number[]): boolean {
  if (prev.length !== 3 || next.length !== 3) return false
  return next[0] === prev[0] + 1 && next[1] === prev[1] + 1 && next[2] === prev[2] + 1
}

function MixedSummaryPreviewLine({
  step,
  summarySyncShimmer,
  lineClassName,
  previewTypography = 'step',
  last3LineIcons = false,
  last3ThinkingSummaryFullWidth = false,
}: {
  step: MixedStep | undefined
  summarySyncShimmer: boolean
  /** Extra classes on the preview `<p>` (e.g. single-line clamp for last-three stack). */
  lineClassName?: string
  /** `body` — same Inter rhythm as `.figma-ai-tw__paragraph` (commands + reasoning match). */
  previewTypography?: 'step' | 'body'
  /** `#4` + `mixedLast3WithStepIcons`: brain / terminal column before the line (text still aligns with summary). */
  last3LineIcons?: boolean
  /** `#4` tuned mode: for thinking rows, omit icon column so summary text uses full row width. */
  last3ThinkingSummaryFullWidth?: boolean
}) {
  if (!step) return null
  const last3ToolcallSlot =
    step.kind === 'toolcall' && Boolean(lineClassName?.includes('figma-ai-tw__thinkingWgPreviewCmd--last3Slot'))
  const pClass = ['figma-ai-tw__thinkingWgPreviewCmd', lineClassName, last3ToolcallSlot ? 'figma-ai-tw__thinkingWgPreviewCmd--last3Toolcall' : '']
    .filter(Boolean)
    .join(' ')
  const textVariant =
    step.kind === 'toolcall'
      ? 'mono'
      : previewTypography === 'body'
        ? 'body'
        : 'reasoning'
  if (step.kind === 'toolcall') {
    const row = READONLY_TOOLCALLS[step.cmdIndex]
    if (!row) return null
    const p = (
      <p className={pClass}>
        <WgToolcallRowText row={row} summarySyncShimmer={summarySyncShimmer} />
      </p>
    )
    if (!last3LineIcons) return p
    return (
      <div className="figma-ai-tw__thinkingWgPreviewLast3Line figma-ai-tw__thinkingWgPreviewLast3Line--withIcon">
        <div className="figma-ai-tw__thinkingWgPreviewLast3IconCol" aria-hidden>
          {rowStepIconFor(row)}
        </div>
        {p}
      </div>
    )
  }
  const reasoningP = (
    <p
      className={
        previewTypography === 'body'
          ? pClass
          : [pClass, 'figma-ai-tw__thinkingWgPreviewCmd--mixedReasoning'].filter(Boolean).join(' ')
      }
    >
      <WgStepCommandLabel
        label={step.title}
        textVariant={textVariant}
        summarySyncShimmer={summarySyncShimmer}
      />
    </p>
  )
  if (!last3LineIcons || last3ThinkingSummaryFullWidth) return reasoningP
  return (
    <div className="figma-ai-tw__thinkingWgPreviewLast3Line figma-ai-tw__thinkingWgPreviewLast3Line--withIcon">
      <div className="figma-ai-tw__thinkingWgPreviewLast3IconCol" aria-hidden>
        <WgReasoningGlyph className="figma-ai-tw__wgStepGlyph" />
      </div>
      {reasoningP}
    </div>
  )
}

function SummaryPreviewLast3Stack({
  indices,
  reduceMotion,
  summaryLineShimmer,
  last3LineIcons = false,
  last3RailUnderSummaryIcon = false,
  renderLine,
}: {
  indices: number[]
  reduceMotion: boolean
  /** Shimmer on the active (last) preview line only — same rule as single-line #3 preview. */
  summaryLineShimmer: boolean
  /** `#4` + icons: brain / terminal before each preview line; `thinkingWgPreviewLast3--withLineIcons` keeps **24px** inset + spine through row glyph centers (aligned with summary **label**, not the summary terminal slot). */
  last3LineIcons?: boolean
  /** Early mixed run (`settledCount === 0`): spine under the summary **terminal** (8px); after the first step settles, spine follows row glyph centers (`24px + 8px`). */
  last3RailUnderSummaryIcon?: boolean
  renderLine: (stepIndex: number, lineSummaryShimmer: boolean) => ReactNode
}) {
  const [strip, setStrip] = useState<number[]>(() => indices)
  const [translateY, setTranslateY] = useState(0)
  const [stripNoTransition, setStripNoTransition] = useState(true)
  /** Fade the outgoing top row only while the strip is translating — avoids a permanent top scrim on resting text. */
  const [slideOutgoingFade, setSlideOutgoingFade] = useState(false)
  const prevWindowRef = useRef<readonly number[]>([])
  const slidingRef = useRef(false)
  const commitRef = useRef<number[] | null>(null)

  useLayoutEffect(() => {
    if (reduceMotion) {
      slidingRef.current = false
      commitRef.current = null
      setSlideOutgoingFade(false)
      setStripNoTransition(true)
      setStrip(indices)
      setTranslateY(0)
      prevWindowRef.current = indices
      requestAnimationFrame(() => setStripNoTransition(false))
      return
    }

    if (slidingRef.current) return

    const prev = prevWindowRef.current
    if (shouldSlideLast3Window(prev, indices)) {
      slidingRef.current = true
      commitRef.current = [...indices]
      setStripNoTransition(true)
      setStrip([...prev, indices[2]!])
      setTranslateY(0)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideOutgoingFade(true)
          setStripNoTransition(false)
          setTranslateY(-LAST3_STRIDE_PX)
        })
      })
      return
    }

    setSlideOutgoingFade(false)
    setStripNoTransition(true)
    setStrip(indices)
    setTranslateY(0)
    prevWindowRef.current = indices
    requestAnimationFrame(() => setStripNoTransition(false))
  }, [indices, reduceMotion])

  const onStripTransitionEnd = useCallback((e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.propertyName !== 'transform') return
    if (!slidingRef.current) return
    const commit = commitRef.current
    slidingRef.current = false
    commitRef.current = null
    if (!commit) return
    setSlideOutgoingFade(false)
    setStripNoTransition(true)
    setStrip(commit)
    setTranslateY(0)
    prevWindowRef.current = commit
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setStripNoTransition(false))
    })
  }, [])

  const viewportSlots = Math.min(3, Math.max(1, strip.length))
  /** Bottom of the last-3 window — the step currently in progress (same index as `settledCount` while running). */
  const activeStepIndex = indices.length > 0 ? indices[indices.length - 1]! : -1

  return (
    <div
      className={[
        'figma-ai-tw__thinkingWgPreviewLast3',
        last3LineIcons ? 'figma-ai-tw__thinkingWgPreviewLast3--withLineIcons' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-last3-rail-anchor={
        last3LineIcons && last3RailUnderSummaryIcon ? 'summary' : last3LineIcons ? 'rows' : undefined
      }
      style={{ ['--tw-last3-visible-slots' as string]: String(viewportSlots) } as CSSProperties}
    >
      <div
        className={[
          'figma-ai-tw__thinkingWgPreviewLast3Viewport',
          slideOutgoingFade ? 'figma-ai-tw__thinkingWgPreviewLast3Viewport--slideOutgoingFade' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[
            'figma-ai-tw__thinkingWgPreviewLast3Strip',
            stripNoTransition ? 'figma-ai-tw__thinkingWgPreviewLast3Strip--noTransition' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ transform: `translateY(${translateY}px)` }}
          onTransitionEnd={onStripTransitionEnd}
        >
          {strip.map((idx) => {
            const lineShimmer = summaryLineShimmer && idx === activeStepIndex
            return (
              <div
                key={`${idx}`}
                className={[
                  'figma-ai-tw__thinkingWgPreviewLast3Row',
                  lineShimmer ? 'figma-ai-tw__thinkingWgPreviewLast3Row--activeShimmer' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {renderLine(idx, lineShimmer)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ThinkingWgReasoningStream({
  variant,
  phase,
  settledCount,
  isRunning,
  paragraphsVisible,
  currentProductionFeed,
  cpTimelineSpine = false,
}: {
  variant: 'feed' | 'list'
  phase: Phase
  settledCount: number
  isRunning: boolean
  paragraphsVisible: number
  /** `#0` current-production reasoning: snippet card, hover-only expand, body in fixed-height scroll viewport. */
  currentProductionFeed?: boolean
  cpTimelineSpine?: boolean
}) {
  const thinking = phase === 'revealing' && isRunning && settledCount < 1
  const cpStreaming = Boolean(currentProductionFeed && phase === 'revealing' && isRunning)
  const cpHeadlineDone = formatReasoningCpThinkingGroupCompletedHeadline(REASONING_THOUGHT_SECONDS)
  const bodyScrollRef = useRef<HTMLDivElement>(null)
  const { showTopScrim, syncTopScrim } = useReasoningCpViewportTopScrim(bodyScrollRef)
  const [cpExpanded, setCpExpanded] = useState(false)
  const anchorToggle = useFeedExpandAnchor(AIA_CP_BODY_EXPAND_REVEAL_MS)
  const onCpHeaderClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      anchorToggle(event, () => setCpExpanded((v) => !v))
    },
    [anchorToggle],
  )

  useLayoutEffect(() => {
    if (!currentProductionFeed) return
    const el = bodyScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    syncTopScrim()
  }, [paragraphsVisible, currentProductionFeed, phase, settledCount, isRunning, cpExpanded, syncTopScrim])

  useEffect(() => {
    if (!currentProductionFeed) return
    const el = bodyScrollRef.current
    if (!el) return
    syncTopScrim()
    el.addEventListener('scroll', syncTopScrim, { passive: true })
    const ro = new ResizeObserver(() => syncTopScrim())
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', syncTopScrim)
      ro.disconnect()
    }
  }, [currentProductionFeed, syncTopScrim, paragraphsVisible, phase, settledCount, isRunning, cpExpanded])

  const titleInnerCp = cpStreaming ? (
    <span className="figma-ai-tw__thinkingWgReasoningHeadTitleBusy">{REASONING_CP_THINKING_GROUP_PROGRESS_HEADLINE}</span>
  ) : (
    cpHeadlineDone
  )

  const titleInnerList = thinking ? (
    <span className="figma-ai-tw__thinkingWgReasoningHeadTitleBusy">{REASONING_STREAM_SECTION_HEADLINE}</span>
  ) : (
    REASONING_STREAM_SECTION_HEADLINE
  )

  const titleInner = currentProductionFeed ? titleInnerCp : titleInnerList

  /** `#0` CP: peek + scroll body only while streaming or user expanded; finished + collapsed = headline row only. */
  const showReasoningCpBody = Boolean(cpStreaming || cpExpanded)

  const onCpPeekExpand = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (cpExpanded || !showReasoningCpBody) return
      const header = event.currentTarget
        .closest('.figma-ai-tw__snippet')
        ?.querySelector('.figma-ai-tw__snippetHeader') as HTMLElement | null
      anchorToggle(event, () => setCpExpanded(true), header)
    },
    [anchorToggle, cpExpanded, showReasoningCpBody],
  )

  const head = currentProductionFeed ? (
    <div className="figma-ai-tw__thinkingWgReasoningHead figma-ai-tw__thinkingWgReasoningHead--cp">
      <span
        className="figma-ai-tw__thinkingWgReasoningCpLead"
        style={
          {
            '--fa-reasoning-mask-url': `url("${ideIcons.reasoning}")`,
          } as CSSProperties
        }
        aria-hidden
      >
        <span className="figma-ai-tw__thinkingWgReasoningCpLead__chevron">
          <IconChevronDown className="figma-ai-tw__wgStepGlyph" />
        </span>
        <span className="figma-ai-tw__thinkingWgReasoningCpLead__brain" />
      </span>
      <span className="figma-ai-tw__thinkingWgReasoningHeadTitle">{titleInner}</span>
    </div>
  ) : (
    <div className="figma-ai-tw__thinkingWgReasoningHead">
      <span className="figma-ai-tw__thinkingWgReasoningHeadLead" aria-hidden>
        <span className="figma-ai-tw__thinkingWgReasoningHeadLead__chevron">
          <IconChevronDown className="figma-ai-tw__wgStepGlyph" />
        </span>
        <span className="figma-ai-tw__thinkingWgReasoningHeadLead__glyph">
          <WgReasoningGlyph className="figma-ai-tw__wgStepGlyph" />
        </span>
      </span>
      <span className="figma-ai-tw__thinkingWgReasoningHeadTitle">{titleInner}</span>
    </div>
  )

  const streamWords = phase === 'revealing' && isRunning
  const body =
    currentProductionFeed || streamWords ? (
      <ReasoningStreamingBody visibleCount={paragraphsVisible} streaming={streamWords} />
    ) : (
      <ReasoningBodyParagraphs visibleCount={paragraphsVisible} />
    )

  if (!currentProductionFeed) {
    return (
      <div className={`figma-ai-tw__thinkingWgReasoningBlock figma-ai-tw__thinkingWgReasoningBlock--${variant}`}>
        {head}
        {body}
      </div>
    )
  }

  return (
    <div
      className={[
        'figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--thinkingWgFeed figma-ai-tw__snippetWrap--thinkingWgReasoningCp',
        cpTimelineSpine ? 'figma-ai-tw__snippetWrap--thinkingWgCpTimelineSpine' : '',
        cpExpanded ? 'figma-ai-tw__snippetWrap--reasoningCpExpanded' : '',
        !showReasoningCpBody ? 'figma-ai-tw__snippetWrap--reasoningCpHeadOnly' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={`figma-ai-tw__snippet figma-ai-tw__snippet--thinkingWgReasoningCp${cpStreaming ? ' figma-ai-tw__snippet--thinkingWgRunning' : ''}${cpExpanded ? ' figma-ai-tw__snippet--thinkingWgReasoningCpExpanded' : ''}${!showReasoningCpBody ? ' figma-ai-tw__snippet--thinkingWgReasoningCpHeadOnly' : ''}`}
        aria-busy={cpStreaming ? true : undefined}
      >
        <div className="figma-ai-tw__snippetHeader">
          <button
            type="button"
            className="figma-ai-tw__thinkingWgReasoningCpHeaderBtn"
            aria-expanded={cpExpanded}
            aria-controls="thinking-wg-reasoning-cp-body"
            aria-label={
              cpExpanded
                ? `Collapse reasoning: ${cpStreaming ? REASONING_CP_THINKING_GROUP_PROGRESS_HEADLINE : cpHeadlineDone}`
                : `Expand reasoning: ${cpStreaming ? REASONING_CP_THINKING_GROUP_PROGRESS_HEADLINE : cpHeadlineDone}`
            }
            onClick={onCpHeaderClick}
          >
            <span className="figma-ai-tw__snippetLeft figma-ai-tw__snippetLeft--reasoningCp">{head}</span>
          </button>
        </div>
        <div
          className={[
            'figma-ai-tw__thinkingWgReasoningCpBodyReveal',
            showReasoningCpBody ? 'figma-ai-tw__thinkingWgReasoningCpBodyReveal--open' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={!showReasoningCpBody}
        >
          <div
            className="figma-ai-tw__thinkingWgReasoningCpBodyRevealInner"
            {...(!showReasoningCpBody ? { inert: true } : {})}
          >
            <div
              className={[
                'figma-ai-tw__thinkingWgReasoningCpBodyShell',
                cpExpanded ? '' : 'figma-ai-tw__thinkingWgReasoningCpBodyShell--peek',
                showTopScrim ? 'figma-ai-tw__thinkingWgReasoningCpBodyShell--topScrim' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={cpExpanded || !showReasoningCpBody ? undefined : onCpPeekExpand}
            >
              <div
                id="thinking-wg-reasoning-cp-body"
                ref={bodyScrollRef}
                className="figma-ai-tw__thinkingWgReasoningCpBodyViewport"
              >
                {body}
              </div>
            </div>
          </div>
        </div>
        <div className="figma-ai-tw__snippetOutline" aria-hidden />
      </div>
    </div>
  )
}

/**
 * #0 toolcalls feed: same chrome as default AI chat snippet row — terminal/cross, mono command.
 */
function ThinkingWgFeedSnippet({ ok, label, running }: { ok: boolean; label: string; running?: boolean }) {
  const cmd = stripShellDollar(label)
  const snippetClass = [
    'figma-ai-tw__snippet',
    !ok && !running ? 'figma-ai-tw__snippet--thinkingWgFail' : '',
    running ? 'figma-ai-tw__snippet--thinkingWgRunning' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--thinkingWgFeed" role="listitem">
      <div className={snippetClass} aria-busy={running ? true : undefined}>
        <div className="figma-ai-tw__snippetHeader">
          <div className="figma-ai-tw__snippetLeft">
            <span className="figma-ai-tw__snippetIcon">
              {running ? (
                <SnippetIdeActivitySpinner />
              ) : (
                <WgToolcallStatusImg ok={ok} className="figma-ai-tw__wgToolcallStatusImg--snippet" />
              )}
            </span>
            <p className="figma-ai-tw__snippetCmd figma-ai-tw__snippetCmd--thinkingWgTruncate">
              <span
                className={
                  running
                    ? 'm figma-ai-tw__snippetCmdMono figma-ai-tw__wgStepText--pending'
                    : `m figma-ai-tw__snippetCmdMono${ok ? '' : ' figma-ai-tw__snippetCmdMono--failed'}`
                }
              >
                {cmd}
              </span>
            </p>
          </div>
          <div className="figma-ai-tw__snippetRight">
            <button type="button" className="figma-ai-tw__iconHit" aria-label="More" tabIndex={-1}>
              <span className="figma-ai-tw__icon16">
                <TwIconImg src={ideIcons.commandMore} alt="" />
              </span>
            </button>
            <button type="button" className="figma-ai-tw__iconHit" aria-label="Open in tool window" tabIndex={-1}>
              <span className="figma-ai-tw__icon16">
                <TwIconImg src={ideIcons.commandOpen} alt="" />
              </span>
            </button>
            <button type="button" className="figma-ai-tw__iconHit" aria-label="Expand" tabIndex={-1}>
              <span className="figma-ai-tw__icon16">
                <TwIconImg src={ideIcons.commandExpand} alt="" />
              </span>
            </button>
          </div>
        </div>
        <div className="figma-ai-tw__snippetOutline" aria-hidden />
      </div>
    </div>
  )
}

type WgSummaryToggleProps = {
  isExpanded: boolean
  summaryLocked: boolean
  expandedListClosing: boolean
  revealCommandListOpen: boolean
  summaryAccessible: string
  resolvingVisibleLabel: string
  okCount: number
  failCount: number
  totalSteps: number
  /** Terminal-forward summary for `toolcalls` + `mixed`; reasoning headline only for `reasoning`. */
  panelKind: ThinkingWgPanelKind
  /** `#2` summary-first toolcalls only: mono + live command in the summary row while locked. `#3` preview keeps Inter + counts. */
  toolcallsSummaryUseCommandMono: boolean
  /** Working / `#2` mixed: live HUD strings are long — force single-line ellipsis in the summary row. */
  mixedSummaryLiveSingleLine: boolean
  toggleSummary: () => void
}

/** Summary line + chevron — lives in the summary stack; expand list is steps-only (no duplicate row). */
function WgSummaryToggle({
  isExpanded,
  summaryLocked,
  expandedListClosing,
  revealCommandListOpen,
  summaryAccessible,
  resolvingVisibleLabel,
  okCount,
  failCount,
  totalSteps,
  panelKind,
  toolcallsSummaryUseCommandMono,
  mixedSummaryLiveSingleLine,
  toggleSummary,
}: WgSummaryToggleProps) {
  const summaryIcon =
    panelKind === 'reasoning' ? (
      <WgReasoningGlyph className="figma-ai-tw__wgStepGlyph" />
    ) : (
      <WgToolcallStatusImg ok className="figma-ai-tw__wgStepGlyph" />
    )
  const summaryResolvedText =
    panelKind === 'reasoning'
      ? REASONING_STREAM_SECTION_HEADLINE
      : panelKind === 'mixed'
        ? WG_SUMMARY_MIXED_RESOLVED_LABEL
        : `Ran ${okCount} & failed ${failCount} commands`

  /** `#2` toolcalls: summary row shows live command in mono; `#3` preview uses Inter + Ran/failed counts only. */
  const summaryTextClass = [
    'figma-ai-tw__wgSummaryText',
    toolcallsSummaryUseCommandMono ? 'figma-ai-tw__wgSummaryText--toolcallsCommandLive' : '',
    mixedSummaryLiveSingleLine ? 'figma-ai-tw__wgSummaryText--mixedSummaryLive' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={`figma-ai-tw__wgSummaryBtn${isExpanded ? ' figma-ai-tw__wgSummaryBtn--expanded' : ''}${summaryLocked ? ' figma-ai-tw__wgSummaryBtn--resolving' : ''}`}
      onClick={toggleSummary}
      disabled={expandedListClosing}
      aria-expanded={isExpanded}
      aria-busy={summaryLocked && !revealCommandListOpen ? true : expandedListClosing ? true : undefined}
      aria-controls="thinking-wg-command-list"
      id="thinking-wg-summary-toggle"
      aria-label={isExpanded ? `Collapse: ${summaryAccessible}` : `Expand: ${summaryAccessible}`}
    >
      <span className="figma-ai-tw__wgSummaryIconCluster" aria-hidden>
        <span className="figma-ai-tw__wgSummaryTerminalSlot">{summaryIcon}</span>
        <span className="figma-ai-tw__wgSummaryChevronSlot">
          <IconChevronDown className="figma-ai-tw__wgStepGlyph" />
        </span>
      </span>
      <span className={summaryTextClass}>
        {summaryLocked ? (
          revealCommandListOpen ? (
            <span>{resolvingVisibleLabel}</span>
          ) : (
            <span className="figma-ai-tw__wgSummaryTextShimmer">{resolvingVisibleLabel}</span>
          )
        ) : (
          summaryResolvedText
        )}
      </span>
    </button>
  )
}

export function ThinkingWgToolcallsPanel({
  demoMode = 'listReveal',
  demoControl = 'auto',
  panelKind = 'toolcalls',
  onComposerTrailingActionVisual,
  mixedCpTraceStyle = 'default',
  cpTimelineSpine = false,
  mixedExpandRailVariant = 'segmented',
  mixedLast3WithStepIcons = false,
  mixedCpFullPage = false,
}: ThinkingWgToolcallsPanelProps = {}) {
  const reduceMotionPreview = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false),
    [],
  )

  /** New random cadence each mount (Restart remounts the panel via `key`). */
  const [streamTimingSeed] = useState(() => (Math.random() * 0xffffffff) >>> 0)
  const jitteredToolcallRunMs = useMemo(
    () => RUN_MS.map((ms, i) => applyRunMsJitter(ms, streamTimingSeed, i + 17)),
    [streamTimingSeed],
  )

  const [phase, setPhase] = useState<Phase>('revealing')
  /** Rows with index < settledCount are done. */
  const [settledCount, setSettledCount] = useState(0)
  /** Row `settledCount` is “running” (terminal + gradient) while true. */
  const [isRunning, setIsRunning] = useState(true)
  /** How many follow-up narrative lines are mounted (0 … POST_REVEAL_LINES.length). */
  const [postRevealVisibleLines, setPostRevealVisibleLines] = useState(0)
  const postRevealStaggerDoneRef = useRef(false)
  /** Playing collapse animation before `phase` leaves `expanded`. */
  const [expandedListClosing, setExpandedListClosing] = useState(false)
  const expandListWrapRef = useRef<HTMLDivElement>(null)
  /** summaryFirst / summaryPreview / summaryPreviewLast3 + revealing: user can expand to peek full command list before timeline finishes. */
  const [revealCommandListOpen, setRevealCommandListOpen] = useState(false)
  /** Peek list is animating closed (keep mounted until `grid-template-rows` transition ends). */
  const [peekListClosing, setPeekListClosing] = useState(false)
  /** Drives `grid-template-rows` 0fr → 1fr so content below slides instead of jumping. */
  const [expandListHeightOpen, setExpandListHeightOpen] = useState(false)
  const expandListHeightOpenRef = useRef(false)
  /** `#1` listReveal: collapse inline step box before `phase` becomes `summary`. */
  const [listRevealBoxClosing, setListRevealBoxClosing] = useState(false)
  const listRevealBoxWrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    expandListHeightOpenRef.current = expandListHeightOpen
  }, [expandListHeightOpen])

  /** Reasoning body: progressive paragraph count during `revealing` (auto) or from `snap`. */
  const [reasoningVisibleParagraphCount, setReasoningVisibleParagraphCount] = useState(0)
  /** Working / `#2` mixed: throttled live summary line while `summaryLocked` (see `WORKING_MIXED_SUMMARY_FIRST_HUD_MS`). */
  const [mixedSummaryFirstHud, setMixedSummaryFirstHud] = useState(WG_SUMMARY_MIXED_BUSY_LABEL)

  const STEP_ROWS = READONLY_TOOLCALLS
  const total =
    panelKind === 'reasoning' ? 1 : panelKind === 'mixed' ? WORKING_MIXED_STEP_COUNT : STEP_ROWS.length
  const snap =
    demoControl !== 'auto'
      ? getSyntheticSnapshot(demoMode, demoControl as Exclude<ThinkingWgDemoControl, 'auto'>, panelKind)
      : null
  const eff: WgEffState =
    snap ??
    {
      phase,
      settledCount,
      isRunning,
      postRevealVisibleLines,
      revealCommandListOpen,
      peekListClosing,
      expandedListClosing,
      expandListHeightOpen,
      ...(panelKind === 'reasoning' ? { reasoningParagraphsVisible: reasoningVisibleParagraphCount } : {}),
    }

  const effHudRef = useRef(eff)
  effHudRef.current = eff

  useEffect(() => {
    if (!onComposerTrailingActionVisual) return
    const lineCount = POST_REVEAL_LINES.length
    if (demoControl !== 'auto') {
      const st = getSyntheticSnapshot(demoMode, demoControl, panelKind)
      const showStop =
        st.phase === 'revealing' ||
        (st.phase === 'summary' && st.postRevealVisibleLines < lineCount)
      onComposerTrailingActionVisual(showStop ? 'stop' : 'send')
      return
    }
    const showStop =
      eff.phase === 'revealing' ||
      (eff.phase === 'summary' && eff.postRevealVisibleLines < lineCount)
    onComposerTrailingActionVisual(showStop ? 'stop' : 'send')
  }, [
    onComposerTrailingActionVisual,
    demoControl,
    demoMode,
    panelKind,
    eff.phase,
    eff.postRevealVisibleLines,
  ])

  const reasoningParasToShow = useMemo(() => {
    if (panelKind !== 'reasoning') return 0
    if (eff.phase !== 'revealing') return REASONING_PARAGRAPH_COUNT
    const v = eff.reasoningParagraphsVisible
    if (v != null) return Math.min(REASONING_PARAGRAPH_COUNT, v)
    return REASONING_PARAGRAPH_COUNT
  }, [panelKind, eff.phase, eff.reasoningParagraphsVisible])

  const okCount = useMemo(() => READONLY_TOOLCALLS.filter((r) => r.ok).length, [])
  const failCount = READONLY_TOOLCALLS.length - okCount

  const { ranOk, ranFail } = useMemo(() => {
    if (panelKind === 'reasoning') {
      const sc = snap ? snap.settledCount : settledCount
      return { ranOk: sc >= 1 ? 1 : 0, ranFail: 0 }
    }
    const sc = snap ? snap.settledCount : settledCount
    if (panelKind === 'mixed') {
      let o = 0
      let f = 0
      for (let i = 0; i < sc; i++) {
        const step = WORKING_MIXED_STEPS[i]
        if (step?.kind !== 'toolcall') continue
        const row = READONLY_TOOLCALLS[step.cmdIndex]
        if (row?.ok) o++
        else f++
      }
      return { ranOk: o, ranFail: f }
    }
    let o = 0
    let f = 0
    for (let i = 0; i < sc; i++) {
      if (STEP_ROWS[i]?.ok) o++
      else f++
    }
    return { ranOk: o, ranFail: f }
  }, [snap, settledCount, STEP_ROWS, panelKind])

  const allDone =
    panelKind === 'reasoning'
      ? eff.settledCount >= 1 && !eff.isRunning
      : eff.settledCount >= total && !eff.isRunning

  useEffect(() => {
    setPhase('revealing')
    setSettledCount(0)
    setIsRunning(true)
    postRevealStaggerDoneRef.current = false
    setPostRevealVisibleLines(0)
    setExpandedListClosing(false)
    setRevealCommandListOpen(false)
    setPeekListClosing(false)
    setExpandListHeightOpen(false)
    setReasoningVisibleParagraphCount(0)
    setListRevealBoxClosing(false)
    setMixedSummaryFirstHud(WG_SUMMARY_MIXED_BUSY_LABEL)
  }, [demoMode, panelKind])

  useEffect(() => {
    if (demoControl !== 'auto') return
    setPhase('revealing')
    setSettledCount(0)
    setIsRunning(true)
    postRevealStaggerDoneRef.current = false
    setPostRevealVisibleLines(0)
    setExpandedListClosing(false)
    setRevealCommandListOpen(false)
    setPeekListClosing(false)
    setExpandListHeightOpen(false)
    setReasoningVisibleParagraphCount(0)
    setListRevealBoxClosing(false)
    setMixedSummaryFirstHud(WG_SUMMARY_MIXED_BUSY_LABEL)
  }, [demoControl, panelKind])

  useEffect(() => {
    if (demoControl !== 'auto') return
    if (phase !== 'revealing') return

    if (panelKind === 'reasoning') {
      setSettledCount(0)
      setIsRunning(true)
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const timers: number[] = []
      if (reduceMotion) {
        setReasoningVisibleParagraphCount(REASONING_PARAGRAPH_COUNT)
      } else {
        setReasoningVisibleParagraphCount(0)
        for (let i = 0; i < REASONING_PARAGRAPH_REVEAL_AT_MS.length; i++) {
          const at = REASONING_PARAGRAPH_REVEAL_AT_MS[i]!
          const idx = i
          timers.push(
            window.setTimeout(() => {
              setReasoningVisibleParagraphCount(idx + 1)
            }, at),
          )
        }
      }
      const tDone = window.setTimeout(() => {
        setSettledCount(1)
        setIsRunning(false)
      }, REASONING_STREAM_MS)
      const tSummary = window.setTimeout(() => {
        if (
          demoMode === 'listReveal' &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
          setListRevealBoxClosing(true)
        } else {
          setPhase('summary')
        }
      }, REASONING_STREAM_MS + HOLD_AFTER_LAST_MS)
      return () => {
        for (const t of timers) window.clearTimeout(t)
        window.clearTimeout(tDone)
        window.clearTimeout(tSummary)
      }
    }

    if (panelKind === 'mixed') {
      setSettledCount(0)
      setIsRunning(true)
      const timers: number[] = []
      let acc = 0
      const n = WORKING_MIXED_STEP_COUNT
      for (let i = 0; i < n; i++) {
        const step = WORKING_MIXED_STEPS[i]
        acc += step ? mixedStepDurationMs(step, streamTimingSeed) : 2000
        const idx = i
        timers.push(
          window.setTimeout(() => {
            setSettledCount(idx + 1)
            setIsRunning(idx + 1 < n)
          }, acc),
        )
      }
      timers.push(
        window.setTimeout(() => {
          if (
            demoMode === 'listReveal' &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ) {
            setListRevealBoxClosing(true)
          } else {
            setPhase('summary')
          }
        }, acc + HOLD_AFTER_LAST_MS),
      )
      return () => {
        for (const t of timers) window.clearTimeout(t)
      }
    }

    setSettledCount(0)
    setIsRunning(true)

    const timers: number[] = []
    let acc = 0
    const n = total

    for (let i = 0; i < n; i++) {
      acc += jitteredToolcallRunMs[i] ?? 2000
      const idx = i
      timers.push(
        window.setTimeout(() => {
          setSettledCount(idx + 1)
          setIsRunning(idx + 1 < n)
        }, acc),
      )
    }

    timers.push(
      window.setTimeout(() => {
        if (
          demoMode === 'listReveal' &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
          setListRevealBoxClosing(true)
        } else {
          setPhase('summary')
        }
      }, acc + HOLD_AFTER_LAST_MS),
    )

    return () => {
      for (const t of timers) window.clearTimeout(t)
    }
  }, [phase, demoMode, demoControl, panelKind, total, streamTimingSeed, jitteredToolcallRunMs])

  /** After listReveal inline box starts collapsing, wait for CSS then enter `summary`. */
  useEffect(() => {
    if (demoControl !== 'auto') return
    if (!listRevealBoxClosing) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('summary')
      setListRevealBoxClosing(false)
      return
    }

    const el = listRevealBoxWrapRef.current
    if (!el) {
      setPhase('summary')
      setListRevealBoxClosing(false)
      return
    }

    let done = false
    const finish = () => {
      if (done) return
      done = true
      setPhase('summary')
      setListRevealBoxClosing(false)
    }

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== el) return
      if (e.propertyName !== 'grid-template-rows') return
      finish()
    }

    el.addEventListener('transitionend', onTransitionEnd)
    const safety = window.setTimeout(finish, LIST_REVEAL_BOX_COLLAPSE_MS)
    return () => {
      window.clearTimeout(safety)
      el.removeEventListener('transitionend', onTransitionEnd)
    }
  }, [listRevealBoxClosing, demoControl])

  useEffect(() => {
    if (demoControl !== 'auto') return
    if (phase === 'revealing') {
      postRevealStaggerDoneRef.current = false
      setPostRevealVisibleLines(0)
      setExpandedListClosing(false)
      setRevealCommandListOpen(false)
      setPeekListClosing(false)
      setExpandListHeightOpen(false)
      setListRevealBoxClosing(false)
      return
    }
    if (phase !== 'summary' && phase !== 'expanded') return

    const lineCount = POST_REVEAL_LINES.length

    if (phase === 'expanded') {
      setPostRevealVisibleLines(lineCount)
      postRevealStaggerDoneRef.current = true
      return
    }

    if (postRevealStaggerDoneRef.current) {
      setPostRevealVisibleLines(lineCount)
      return
    }

    setPostRevealVisibleLines(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPostRevealVisibleLines(lineCount)
      postRevealStaggerDoneRef.current = true
      return
    }

    const timers: number[] = []
    for (let i = 0; i < lineCount; i++) {
      const delay = POST_REVEAL_FIRST_MS + i * POST_REVEAL_LINE_STEP_MS
      timers.push(window.setTimeout(() => setPostRevealVisibleLines(i + 1), delay))
    }
    timers.push(
      window.setTimeout(() => {
        postRevealStaggerDoneRef.current = true
      }, POST_REVEAL_FIRST_MS + lineCount * POST_REVEAL_LINE_STEP_MS),
    )

    return () => {
      for (const t of timers) window.clearTimeout(t)
    }
  }, [phase, demoControl])

  useEffect(() => {
    if (demoControl !== 'auto') return
    if (phase === 'summary') {
      setRevealCommandListOpen(false)
    }
  }, [phase, demoControl])

  const summaryFirstStyle = demoMode === 'summaryFirst' || demoMode === 'summaryPreview' || demoMode === 'summaryPreviewLast3'
  /** THINKING-WG `#4` + `twg-working-summary-preview-last3-icons`: preview + expanded strip show step glyphs. */
  const mixedLast3IconsChrome = Boolean(mixedLast3WithStepIcons && panelKind === 'mixed' && demoMode === 'summaryPreviewLast3')
  const showSummaryRow =
    demoMode !== 'currentProduction' && (summaryFirstStyle || eff.phase === 'summary' || eff.phase === 'expanded')
  const summaryLocked = summaryFirstStyle && eff.phase === 'revealing'
  const summaryPreviewCurrent = computeSummaryPreviewCurrentIndex(
    demoMode,
    summaryLocked,
    eff.isRunning,
    eff.settledCount,
    total,
  )
  const summaryPreviewLast3Indices = computeSummaryPreviewLast3Indices(
    demoMode,
    panelKind,
    summaryLocked,
    eff.isRunning,
    eff.settledCount,
    total,
  )
  const isCommandListExpanded =
    eff.phase === 'expanded' || (summaryLocked && (eff.revealCommandListOpen || eff.peekListClosing))
  const isExpanded = isCommandListExpanded
  /** Summary-first / preview: hide preview block under the toggle while the command list is expanded (toggle stays in the stack). */
  const hideSummaryStackWhileCommandListOpen = summaryFirstStyle && isCommandListExpanded
  const showPostReveal = eff.phase === 'summary' || eff.phase === 'expanded'
  const showListDuringRevealInner =
    demoMode === 'listReveal' &&
    eff.phase === 'revealing' &&
    (panelKind === 'reasoning' || eff.settledCount > 0 || eff.isRunning)
  /** Keep inline `wgStepBox` mounted while `listRevealBoxClosing` runs collapse animation. */
  const showListDuringReveal = showListDuringRevealInner || listRevealBoxClosing

  /** `#2` Working mixed while the trace runs: same last-three strip as `#4` (summary row shows stable busy label). */
  const mixedSummaryFirstShowsLast3Stack =
    demoMode === 'summaryFirst' &&
    panelKind === 'mixed' &&
    summaryLocked &&
    eff.isRunning &&
    eff.settledCount < total

  useEffect(() => {
    if (!(panelKind === 'mixed' && summaryLocked)) return
    if (mixedSummaryFirstShowsLast3Stack) {
      return
    }
    const tick = () => {
      const e = effHudRef.current
      setMixedSummaryFirstHud(mixedSummaryFirstHudLine(e.settledCount, e.isRunning))
    }
    tick()
    const id = window.setInterval(tick, WORKING_MIXED_SUMMARY_FIRST_HUD_MS)
    return () => window.clearInterval(id)
  }, [panelKind, summaryLocked, mixedSummaryFirstShowsLast3Stack])

  /** `aria-label`: toolcalls = command totals; reasoning = thought duration; mixed = commands + reasoning (no counts). */
  const summaryAccessible =
    panelKind === 'reasoning'
      ? summaryLocked
        ? ranOk < 1
          ? `${REASONING_STREAM_SECTION_HEADLINE} — in progress`
          : `${REASONING_STREAM_SECTION_HEADLINE} — wrapping up`
        : `${REASONING_STREAM_SECTION_HEADLINE} — full reasoning below; expand to read`
      : panelKind === 'mixed'
        ? summaryLocked
          ? `${mixedSummaryFirstShowsLast3Stack ? WG_SUMMARY_MIXED_BUSY_LABEL : mixedSummaryFirstHud} — in progress`
          : `${WG_SUMMARY_MIXED_RESOLVED_LABEL} — expand for full trace`
        : summaryLocked
          ? demoMode === 'summaryPreview' || demoMode === 'summaryPreviewLast3'
            ? ranOk < 1
              ? `Running commands — ${ranFail} failed, ${ranOk} succeeded so far`
              : ranFail < 1
                ? `Ran ${ranOk} commands`
                : `Ran ${ranOk} & failed ${ranFail} commands`
            : (() => {
                const sc = snap ? snap.settledCount : settledCount
                const run = snap ? snap.isRunning : isRunning
                const n = STEP_ROWS.length
                if (run && sc < n) {
                  const lab = STEP_ROWS[sc] ? stripShellDollar(toolcallRowDisplayLabel(STEP_ROWS[sc])) : 'command'
                  return `Running: ${lab}`
                }
                if (sc >= n && !run) {
                  return `Ran ${okCount} & failed ${failCount} commands — wrapping up`
                }
                return 'Preparing commands'
              })()
          : `Ran ${okCount} & failed ${failCount} commands`

  const resolvingVisibleLabel = useMemo(() => {
    if (!summaryLocked) return ''
    if (panelKind === 'reasoning') {
      return REASONING_STREAM_SECTION_HEADLINE
    }
    if (panelKind === 'mixed') {
      return WG_SUMMARY_MIXED_BUSY_LABEL
    }
    /* `#3` summary + preview: summary row stays Ran/failed counts (preview under shows current command). */
    if (demoMode === 'summaryPreview' || demoMode === 'summaryPreviewLast3') {
      if (ranOk < 1) {
        return WG_SUMMARY_PRE_OK_LABEL
      }
      if (ranFail < 1) {
        return `Ran ${ranOk} commands`
      }
      return `Ran ${ranOk} & failed ${ranFail} commands`
    }
    /* `#2` summary-first toolcalls: live command in the summary row until all finish. */
    const sc = snap ? snap.settledCount : settledCount
    const run = snap ? snap.isRunning : isRunning
    const n = STEP_ROWS.length
    if (run && sc < n) {
      const row = STEP_ROWS[sc]
      return row ? stripShellDollar(toolcallRowDisplayLabel(row)) : WG_SUMMARY_PRE_OK_LABEL
    }
    if (sc >= n && !run) {
      return `Ran ${okCount} & failed ${failCount} commands`
    }
    return WG_SUMMARY_PRE_OK_LABEL
  }, [
    summaryLocked,
    panelKind,
    demoMode,
    snap,
    settledCount,
    isRunning,
    STEP_ROWS,
    okCount,
    failCount,
    ranOk,
    ranFail,
    mixedSummaryFirstHud,
    mixedSummaryFirstShowsLast3Stack,
    total,
  ])

  /** Open: 0fr → 1fr on next frames so the first paint is collapsed and the following text eases down. */
  useEffect(() => {
    if (demoControl !== 'auto') return
    if (!isCommandListExpanded || expandedListClosing || peekListClosing) {
      if (!isCommandListExpanded) setExpandListHeightOpen(false)
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setExpandListHeightOpen(true)
      return
    }

    setExpandListHeightOpen(false)
    let raf2 = 0
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => setExpandListHeightOpen(true))
    })
    return () => {
      window.cancelAnimationFrame(raf1)
      if (raf2) window.cancelAnimationFrame(raf2)
    }
  }, [isCommandListExpanded, expandedListClosing, peekListClosing, demoMode, demoControl])

  /** Collapse: wait for `grid-template-rows` transition, then leave `expanded` or close peek. */
  useEffect(() => {
    if (demoControl !== 'auto') return
    if (!expandedListClosing && !peekListClosing) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (expandedListClosing) {
        setPhase('summary')
        setExpandedListClosing(false)
      }
      if (peekListClosing) {
        setRevealCommandListOpen(false)
        setPeekListClosing(false)
      }
      return
    }

    const el = expandListWrapRef.current
    if (!el) {
      if (expandedListClosing) {
        setPhase('summary')
        setExpandedListClosing(false)
      }
      if (peekListClosing) {
        setRevealCommandListOpen(false)
        setPeekListClosing(false)
      }
      return
    }

    let done = false
    const finish = () => {
      if (done) return
      done = true
      if (expandedListClosing) {
        setPhase('summary')
        setExpandedListClosing(false)
      }
      if (peekListClosing) {
        setRevealCommandListOpen(false)
        setPeekListClosing(false)
      }
    }

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== el) return
      if (e.propertyName !== 'grid-template-rows') return
      finish()
    }
    el.addEventListener('transitionend', onTransitionEnd)
    const safety = window.setTimeout(finish, 360)
    return () => {
      window.clearTimeout(safety)
      el.removeEventListener('transitionend', onTransitionEnd)
    }
  }, [expandedListClosing, peekListClosing, demoControl])

  const toggleSummary = () => {
    if (demoControl !== 'auto') return
    if (expandedListClosing || peekListClosing) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (summaryLocked) {
      if (revealCommandListOpen) {
        if (expandListHeightOpenRef.current && !reduce) {
          setExpandListHeightOpen(false)
          setPeekListClosing(true)
        } else {
          setRevealCommandListOpen(false)
        }
      } else {
        setRevealCommandListOpen(true)
      }
      return
    }
    if (phase === 'summary') {
      setPhase('expanded')
      return
    }
    if (phase === 'expanded') {
      if (expandListHeightOpenRef.current && !reduce) {
        setExpandListHeightOpen(false)
        setExpandedListClosing(true)
      } else {
        setPhase('summary')
      }
    }
  }

  /** #3 / `#2` Working last-3: preview + padding hit the same toggle as the summary row; skip when the event target is the real button. */
  const onSummaryStackClick = (e: MouseEvent<HTMLDivElement>) => {
    if (demoControl !== 'auto') return
    if (
      demoMode !== 'summaryPreview' &&
      demoMode !== 'summaryPreviewLast3' &&
      !(demoMode === 'summaryFirst' && panelKind === 'mixed' && mixedSummaryFirstShowsLast3Stack)
    ) {
      return
    }
    if (expandedListClosing || peekListClosing) return
    const btn = e.currentTarget.querySelector('#thinking-wg-summary-toggle')
    if (btn?.contains(e.target as Node)) return
    toggleSummary()
  }

  /**
   * Mixed summary variants: shimmer on both the summary heading and the lower "actual step" preview line.
   * Toolcalls / reasoning keep the previous single-surface behavior.
   */
  const dualMixedSummaryShimmer =
    panelKind === 'mixed' &&
    summaryLocked &&
    (demoMode === 'summaryPreview' || demoMode === 'summaryPreviewLast3' || mixedSummaryFirstShowsLast3Stack)
  const summaryPreviewLineShimmer = !allDone && (!summaryLocked || dualMixedSummaryShimmer)

  /** Reasoning `#3` only: preview under summary while `summaryLocked`. `#2` (summary only) keeps the headline row without the description strip during load. */
  const showReasoningSummaryPreview =
    panelKind === 'reasoning' &&
    showSummaryRow &&
    !hideSummaryStackWhileCommandListOpen &&
    summaryLocked &&
    demoMode === 'summaryPreview'

  if (demoMode === 'currentProduction') {
    return (
      <>
        <ThinkingWgLeadParagraph />

        <div
          role={panelKind === 'reasoning' || panelKind === 'mixed' ? 'region' : 'list'}
          aria-label={
            panelKind === 'reasoning' ? 'Agent reasoning' : panelKind === 'mixed' ? 'Agent reasoning and commands' : 'Agent steps'
          }
          aria-busy={eff.phase === 'revealing' && !allDone ? true : undefined}
          className={
            panelKind === 'reasoning' || panelKind === 'mixed'
              ? 'figma-ai-tw__thinkingWgFeedList figma-ai-tw__thinkingWgFeedList--reasoning'
              : 'figma-ai-tw__thinkingWgFeedList'
          }
        >
          {panelKind === 'reasoning' ? (
            <ThinkingWgReasoningStream
              variant="feed"
              phase={eff.phase}
              settledCount={eff.settledCount}
              isRunning={eff.isRunning}
              paragraphsVisible={reasoningParasToShow}
              currentProductionFeed
              cpTimelineSpine={cpTimelineSpine}
            />
          ) : panelKind === 'mixed' ? (
            <ThinkingWgMixedCurrentProductionStream
              phase={eff.phase}
              settledCount={eff.settledCount}
              isRunning={eff.isRunning}
              allDone={allDone}
              mixedCpTraceStyle={mixedCpTraceStyle}
              mixedCpFullPage={mixedCpFullPage}
            />
          ) : (
            STEP_ROWS.map((row, i) => {
              if (i < eff.settledCount) {
                return <ThinkingWgFeedSnippet key={i} ok={row.ok} label={toolcallRowDisplayLabel(row)} />
              }
              if (eff.isRunning && i === eff.settledCount) {
                return <ThinkingWgFeedSnippet key={i} ok={row.ok} label={toolcallRowDisplayLabel(row)} running />
              }
              return null
            })
          )}
        </div>

        {showPostReveal ? (
          <div className="figma-ai-tw__thinkingWgPostReveal">
            {POST_REVEAL_LINES.slice(0, eff.postRevealVisibleLines).map((line, i) => (
              <p key={`thinking-wg-post-line-${i}`} className="figma-ai-tw__paragraph figma-ai-tw__thinkingWgPostRevealLine">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </>
    )
  }

  return (
    <div className="figma-ai-tw__thinkingWgRoot">
      <ThinkingWgLeadParagraph />

      {showListDuringReveal ? (
        <div
          ref={listRevealBoxWrapRef}
          className={`figma-ai-tw__thinkingWgListRevealWrap${listRevealBoxClosing ? ' figma-ai-tw__thinkingWgListRevealWrap--collapsing' : ''}`}
        >
          <div className="figma-ai-tw__thinkingWgListRevealInner">
            <div
              className={[
                'figma-ai-tw__wgStepBox',
                panelKind === 'mixed' ? 'figma-ai-tw__wgStepBox--mixedExpand' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role={panelKind === 'reasoning' ? 'region' : 'list'}
              aria-label={
                panelKind === 'reasoning'
                  ? 'Agent reasoning'
                  : panelKind === 'mixed'
                    ? 'Agent reasoning and commands'
                    : 'Agent steps'
              }
              aria-busy={eff.phase === 'revealing' && !allDone ? true : undefined}
            >
              {panelKind === 'reasoning' ? (
                <ThinkingWgReasoningStream
                  variant="list"
                  phase={eff.phase}
                  settledCount={eff.settledCount}
                  isRunning={eff.isRunning}
                  paragraphsVisible={reasoningParasToShow}
                />
              ) : panelKind === 'mixed' ? (
                mixedFlatRows(eff.settledCount, eff.isRunning, false, !allDone)
              ) : (
                wgToolcallRows(eff.settledCount, eff.isRunning, false, STEP_ROWS, !allDone)
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showSummaryRow ? (
        <div
          className={[
            'figma-ai-tw__thinkingWgSummaryStack',
            demoMode === 'summaryPreview' ||
            demoMode === 'summaryPreviewLast3' ||
            mixedSummaryFirstShowsLast3Stack
              ? 'figma-ai-tw__thinkingWgSummaryStack--previewHit'
              : '',
            panelKind === 'reasoning' && !summaryLocked
              ? 'figma-ai-tw__thinkingWgSummaryStack--reasoningResolved'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={
            demoMode === 'summaryPreview' ||
            demoMode === 'summaryPreviewLast3' ||
            mixedSummaryFirstShowsLast3Stack
              ? onSummaryStackClick
              : undefined
          }
        >
          <WgSummaryToggle
            isExpanded={isExpanded}
            summaryLocked={summaryLocked}
            expandedListClosing={expandedListClosing}
            revealCommandListOpen={eff.revealCommandListOpen}
            summaryAccessible={summaryAccessible}
            resolvingVisibleLabel={resolvingVisibleLabel}
            okCount={okCount}
            failCount={failCount}
            totalSteps={total}
            panelKind={panelKind}
            toolcallsSummaryUseCommandMono={
              panelKind === 'toolcalls' && summaryLocked && demoMode === 'summaryFirst'
            }
            mixedSummaryLiveSingleLine={
              panelKind === 'mixed' &&
              summaryLocked &&
              demoMode === 'summaryFirst' &&
              !mixedSummaryFirstShowsLast3Stack
            }
            toggleSummary={toggleSummary}
          />
          {showReasoningSummaryPreview ? (
            <div className="figma-ai-tw__thinkingWgPreviewStatic" aria-label="Latest reasoning lines">
              <ThinkingWgReasoningPreviewStagger
                paragraphCount={reasoningParasToShow}
                reducedMotion={reduceMotionPreview}
                reasoningPreviewSnapshotCycle={panelKind === 'reasoning' && summaryLocked}
                streamingPhase={eff.phase}
              />
            </div>
          ) : summaryPreviewLast3Indices != null && panelKind === 'mixed' && !hideSummaryStackWhileCommandListOpen ? (
            <div
              className="figma-ai-tw__thinkingWgPreviewStatic figma-ai-tw__thinkingWgPreviewStatic--last3Stack"
              aria-live="polite"
              aria-label="Recent steps"
            >
              <SummaryPreviewLast3Stack
                indices={summaryPreviewLast3Indices}
                reduceMotion={reduceMotionPreview}
                summaryLineShimmer={summaryPreviewLineShimmer}
                last3LineIcons={mixedLast3IconsChrome}
                last3RailUnderSummaryIcon={
                  mixedLast3IconsChrome && summaryLocked && eff.isRunning && eff.settledCount === 0
                }
                renderLine={(idx, shimmer) => (
                  <MixedSummaryPreviewLine
                    step={WORKING_MIXED_STEPS[idx]}
                    summarySyncShimmer={shimmer}
                    lineClassName="figma-ai-tw__thinkingWgPreviewCmd--last3Slot"
                    previewTypography="body"
                    last3LineIcons={mixedLast3IconsChrome}
                    last3ThinkingSummaryFullWidth={mixedLast3IconsChrome}
                  />
                )}
              />
            </div>
          ) : summaryPreviewCurrent != null && panelKind === 'mixed' && !hideSummaryStackWhileCommandListOpen ? (
            <div className="figma-ai-tw__thinkingWgPreviewStatic" aria-live="polite" aria-label="Current step">
              <MixedSummaryPreviewLine
                step={WORKING_MIXED_STEPS[summaryPreviewCurrent]}
                summarySyncShimmer={summaryPreviewLineShimmer}
              />
            </div>
          ) : summaryPreviewLast3Indices != null && panelKind === 'toolcalls' && !hideSummaryStackWhileCommandListOpen ? (
            <div
              className="figma-ai-tw__thinkingWgPreviewStatic figma-ai-tw__thinkingWgPreviewStatic--last3Stack"
              aria-live="polite"
              aria-label="Recent steps"
            >
              <SummaryPreviewLast3Stack
                indices={summaryPreviewLast3Indices}
                reduceMotion={reduceMotionPreview}
                summaryLineShimmer={summaryPreviewLineShimmer}
                renderLine={(idx, shimmer) => {
                  const row = STEP_ROWS[idx]
                  if (!row) return null
                  return (
                    <p className="figma-ai-tw__thinkingWgPreviewCmd figma-ai-tw__thinkingWgPreviewCmd--last3Slot figma-ai-tw__thinkingWgPreviewCmd--last3Toolcall">
                      <WgToolcallRowText row={row} summarySyncShimmer={shimmer} />
                    </p>
                  )
                }}
              />
            </div>
          ) : summaryPreviewCurrent != null &&
            panelKind === 'toolcalls' &&
            STEP_ROWS[summaryPreviewCurrent] &&
            !hideSummaryStackWhileCommandListOpen ? (
            <div
              className="figma-ai-tw__thinkingWgPreviewStatic"
              aria-live="polite"
              aria-label="Current command"
            >
              <p className="figma-ai-tw__thinkingWgPreviewCmd">
                <WgToolcallRowText
                  row={STEP_ROWS[summaryPreviewCurrent]}
                  summarySyncShimmer={summaryPreviewLineShimmer}
                />
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {isCommandListExpanded ? (
        <div
          ref={expandListWrapRef}
          className={`figma-ai-tw__thinkingWgExpandList${eff.expandListHeightOpen ? ' figma-ai-tw__thinkingWgExpandList--heightOpen' : ''}${summaryFirstStyle ? ' figma-ai-tw__thinkingWgExpandList--tightSummaryGap' : ''}`}
        >
          <div className="figma-ai-tw__thinkingWgExpandListInner">
            <div
              id="thinking-wg-command-list"
              className={[
                'figma-ai-tw__wgStepBox figma-ai-tw__wgStepBox--afterSummary',
                panelKind === 'reasoning' || panelKind === 'mixed' ? 'figma-ai-tw__wgStepBox--reasoningExpand' : '',
                panelKind === 'mixed' ? 'figma-ai-tw__wgStepBox--mixedExpand' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-wg-mixed-expand-shell={panelKind === 'mixed' ? 'loadingStrip' : undefined}
              data-wg-mixed-loading-strip-icons={panelKind === 'mixed' && mixedLast3IconsChrome ? 'true' : undefined}
              data-wg-mixed-rail={panelKind === 'mixed' ? mixedExpandRailVariant : undefined}
              role={panelKind === 'reasoning' ? 'region' : 'list'}
              aria-label={
                panelKind === 'reasoning'
                  ? 'Full reasoning'
                  : panelKind === 'mixed'
                    ? 'Full reasoning and commands'
                    : 'Agent steps'
              }
              aria-labelledby="thinking-wg-summary-toggle"
              aria-busy={
                panelKind === 'toolcalls' && summaryLocked && eff.revealCommandListOpen && !allDone
                  ? true
                  : panelKind === 'mixed' && summaryLocked && eff.revealCommandListOpen && !allDone
                    ? true
                    : undefined
              }
            >
              {panelKind === 'reasoning' ? (
                <ReasoningBodyParagraphs visibleCount={reasoningParasToShow} />
              ) : panelKind === 'mixed' ? (
                summaryLocked && eff.revealCommandListOpen ? (
                  mixedFlatRows(
                    eff.settledCount,
                    eff.isRunning,
                    true,
                    !allDone,
                    false,
                    'default',
                    mixedLast3IconsChrome,
                  )
                ) : (
                  mixedExpandedDetailedRows(true)
                )
              ) : summaryLocked && eff.revealCommandListOpen ? (
                wgToolcallRows(eff.settledCount, eff.isRunning, true, STEP_ROWS, !allDone)
              ) : (
                wgToolcallRows(total, false, true, STEP_ROWS, false)
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showPostReveal ? (
        <div className="figma-ai-tw__thinkingWgPostReveal">
          {POST_REVEAL_LINES.slice(0, eff.postRevealVisibleLines).map((line, i) => (
            <p key={`thinking-wg-post-line-${i}`} className="figma-ai-tw__paragraph figma-ai-tw__thinkingWgPostRevealLine">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}
