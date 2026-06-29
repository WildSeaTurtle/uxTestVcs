import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import IconMcp from '@icons/Snippet/Snippet Header/Snippet/mcp.svg?react'
import './FigmaAiToolwindow.css'
import {
  AIA_COMPOSER_MCP_READ_FILE_PERMISSION_PROMPT,
  AIA_COMPOSER_NPM_INIT_PERMISSION_PROMPT,
  AIA_CMD_HIGHLIGHT_MCP,
  AIA_CMD_HIGHLIGHT_NPM_INIT,
  AiaComposerMcpPermissionCmdBlock,
  AIA_MCP_READ_FILE_ARGS_PREVIEW,
  AIA_MCP_READ_FILE_TOOL,
  APPROVAL_NPM_INIT_STREAM_LINES,
  AiaComposerNpmInitPermissionCmdLine,
  AiaDefaultSnippetActions,
  ComposerPermissionSubmit,
  SnippetDetailsRequestApproval,
} from './FigmaAiToolwindow'
import { AiaSnippetCmdLine } from './AiaRichTooltip'
import { ideIcons } from './ideIcons'
import { IconChevronDown, IconTerminal } from './uiIcons'


const STREAM_LINE_MS = 480

function IconImg({ src, alt }: { src: string; alt: string }) {
  return <img className="figma-ai-tw__iconImg" src={src} alt={alt} width={16} height={16} />
}

function GrayTerminalIcon() {
  return (
    <span className="figma-ai-tw__snippetIcon">
      <IconTerminal />
    </span>
  )
}

function ComposerFieldMock() {
  return (
    <div className="figma-ai-tw__field">
      <div className="figma-ai-tw__inputTop">
        <textarea
          className="figma-ai-tw__composerInput"
          rows={2}
          readOnly
          tabIndex={-1}
          placeholder="Type task, use @mentions or /commands"
          aria-label="Message"
          defaultValue=""
        />
      </div>
      <div className="figma-ai-tw__attachments" aria-hidden />
      <div className="figma-ai-tw__inputToolbar">
        <div className="figma-ai-tw__inputLeft">
          <button type="button" className="figma-ai-tw__iconHit" aria-label="Add" tabIndex={-1}>
            <span className="figma-ai-tw__icon16">
              <IconImg src={ideIcons.addDark} alt="" />
            </span>
          </button>
          <button type="button" className="figma-ai-tw__dropdownFake" aria-label="Chat mode" tabIndex={-1}>
            <span>Default</span>
            <span className="figma-ai-tw__icon16 figma-ai-tw__icon16--compact">
              <IconChevronDown />
            </span>
          </button>
        </div>
        <div className="figma-ai-tw__inputRight">
          <button type="button" className="figma-ai-tw__iconHit" aria-label="Send" tabIndex={-1}>
            <span className="figma-ai-tw__icon16">
              <IconImg src={ideIcons.send} alt="" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

/** Minimal figma-ai-tw chrome — snippet only, no chat header/footer frame. */
function SnippetStage({
  children,
  variant = 'snippet',
  size = 'feed',
  className = '',
}: {
  children: ReactNode
  variant?: 'snippet' | 'composerPermission'
  size?: 'feed' | 'composer'
  className?: string
}) {
  const stageClass = [
    'figma-ai-tw',
    'llm21607-snippet-stage',
    size === 'feed' ? 'llm21607-snippet-stage--feed' : 'llm21607-snippet-stage--composer',
    variant === 'composerPermission' ? 'figma-ai-tw--approvalInComposer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (variant === 'composerPermission') {
    return (
      <div className={stageClass}>
        <div className="figma-ai-tw__inputSection">{children}</div>
      </div>
    )
  }

  return (
    <div className={stageClass}>
      <div className="figma-ai-tw__feed llm21607-snippet-stage__feed">
        <div className="figma-ai-tw__aiBlock">
          <div className="figma-ai-tw__aiaDefaultSnippets">{children}</div>
        </div>
      </div>
    </div>
  )
}

function ComposerPermissionCard({
  prompt,
  cmdFace,
  optionIds,
  listboxAriaLabel,
  mcp = false,
}: {
  prompt: string
  cmdFace: ReactNode
  optionIds?: readonly string[]
  listboxAriaLabel?: string
  mcp?: boolean
}) {
  const [focusIndex, setFocusIndex] = useState(0)
  const optionButtonRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null])

  const setOptionButtonRef = useCallback((index: number, el: HTMLButtonElement | null) => {
    optionButtonRefs.current[index] = el
  }, [])

  return (
      <div className="figma-ai-tw__composerApprovalDock figma-ai-tw__aiaDefaultSnippets">
        <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
          <div
            className={[
              'figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--pending figma-ai-tw__snippet--composerPermission',
              mcp ? 'figma-ai-tw__snippet--aiaCmdMcp' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <p className="figma-ai-tw__composerPermissionPrompt">{prompt}</p>
            <div className="figma-ai-tw__composerPermissionCmdFace">
              <div className="figma-ai-tw__snippetHeader">{cmdFace}</div>
            </div>
            <div className="figma-ai-tw__snippetDetails">
              <SnippetDetailsRequestApproval
                setOptionButtonRef={setOptionButtonRef}
                focusIndex={focusIndex}
                setFocusIndex={setFocusIndex}
                onConfirm={() => {}}
                optionRowProminent
                composerFocused={false}
                listNavigationHint="arrows"
                optionIds={optionIds}
                listboxAriaLabel={listboxAriaLabel}
              />
            </div>
            <ComposerPermissionSubmit onSkip={() => {}} onSubmit={() => {}} />
            <div className="figma-ai-tw__snippetOutline" aria-hidden />
          </div>
        </div>
      </div>
  )
}

function WaitForUserInputNpmDock() {
  return (
    <ComposerPermissionCard
      prompt={AIA_COMPOSER_NPM_INIT_PERMISSION_PROMPT}
      cmdFace={
        <div className="figma-ai-tw__snippetLeft figma-ai-tw__snippetLeft--composerPermissionCmd">
          <AiaComposerNpmInitPermissionCmdLine />
        </div>
      }
    />
  )
}

function WaitForUserInputMcpDock() {
  return (
    <ComposerPermissionCard
      mcp
      prompt={AIA_COMPOSER_MCP_READ_FILE_PERMISSION_PROMPT}
      listboxAriaLabel="Allow running ijproxy.read_file?"
      optionIds={['fa-showcase-mcp-opt-1', 'fa-showcase-mcp-opt-2', 'fa-showcase-mcp-opt-3']}
      cmdFace={
        <div className="figma-ai-tw__snippetLeft figma-ai-tw__snippetLeft--aiaMcp figma-ai-tw__snippetLeft--composerPermissionMcp">
          <AiaComposerMcpPermissionCmdBlock />
        </div>
      }
    />
  )
}

function useInProgressStream() {
  const [streamCount, setStreamCount] = useState(0)
  const [running, setRunning] = useState(true)

  const restartStream = useCallback(() => {
    setStreamCount(0)
    setRunning(true)
  }, [])

  useEffect(() => {
    if (!running) return undefined
    setStreamCount(0)
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      if (n > APPROVAL_NPM_INIT_STREAM_LINES.length) {
        window.clearInterval(id)
        setRunning(false)
        return
      }
      setStreamCount(n)
    }, STREAM_LINE_MS)
    return () => window.clearInterval(id)
  }, [running])

  return {
    streamLines: APPROVAL_NPM_INIT_STREAM_LINES.slice(0, streamCount),
    running,
    restartStream,
  }
}

function CompactLogTail({
  lines,
  reserveMinLines,
}: {
  lines: readonly string[]
  /** Keep compact viewport height while lines stream in (showcase / in-progress). */
  reserveMinLines?: 1 | 2 | 3
}) {
  const visibleLines = lines.length === 0 ? [] : lines.length <= 3 ? lines : lines.slice(-3)
  if (visibleLines.length === 0 && !reserveMinLines) return null

  const lineCount = Math.min(3, Math.max(visibleLines.length, reserveMinLines ?? 0)) as 1 | 2 | 3
  const streamOverflow = lines.length > 3

  return (
    <div className="figma-ai-tw__aiaNpmInitStreamTailOuter">
      <div
        className="figma-ai-tw__aiaNpmInitStreamTail figma-ai-tw__aiaNpmInitStreamTail--compactStream"
        role="log"
        aria-live="polite"
        aria-label="npm command output"
      >
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
      </div>
    </div>
  )
}

function InProgressFeedRow({
  streamLines,
  running,
}: {
  streamLines: readonly string[]
  running: boolean
}) {
  return (
    <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
      <div
        className="figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--aiaCmdInProgress"
        aria-busy={running ? true : undefined}
      >
        <div className="figma-ai-tw__snippetHeader">
          <div className="figma-ai-tw__snippetLeft">
            <GrayTerminalIcon />
            <AiaSnippetCmdLine
              className="figma-ai-tw__snippetCmd figma-ai-tw__snippetCmd--aiaLoading"
              mono="npm init -y"
              highlight={AIA_CMD_HIGHLIGHT_NPM_INIT}
            />
          </div>
          <div className="figma-ai-tw__snippetRight">
            <AiaDefaultSnippetActions completed={false} inProgress expandLogId="fa-aia-showcase-progress" />
          </div>
        </div>
        <CompactLogTail lines={streamLines} reserveMinLines={3} />
        <div className="figma-ai-tw__snippetOutline" aria-hidden />
      </div>
    </div>
  )
}

export const AIA_CMD_HIGHLIGHT_GRADLE_TEST = (
  <>
    <span className="m p">gradlew</span>
    <span className="m"> </span>
    <span className="m p">test</span>
  </>
)

/** Completed terminal cmd row — reusable in chat feeds and showcases. */
export function AiaCompletedTerminalCmdFeedRow({
  command = 'npm init -y',
  highlight = AIA_CMD_HIGHLIGHT_NPM_INIT,
  expandLogId = 'fa-aia-cmd-completed',
}: {
  command?: string
  highlight?: ReactNode
  expandLogId?: string
}) {
  return (
    <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd llm21607-terminal-state-column--completedHover">
      <div className="figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--aiaCmdCompleted">
        <div className="figma-ai-tw__snippetHeader">
          <div className="figma-ai-tw__snippetLeft">
            <GrayTerminalIcon />
            <AiaSnippetCmdLine
              className="figma-ai-tw__snippetCmd"
              mono={command}
              highlight={highlight}
            />
          </div>
          <div className="figma-ai-tw__snippetRight">
            <AiaDefaultSnippetActions completed expandLogId={expandLogId} />
          </div>
        </div>
        <div className="figma-ai-tw__snippetOutline" aria-hidden />
      </div>
    </div>
  )
}

function CompletedFeedRow() {
  return <AiaCompletedTerminalCmdFeedRow expandLogId="fa-aia-showcase-completed" />
}

function RejectedFeedRow() {
  return (
    <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd llm21607-terminal-state-column--completedHover">
        <div className="figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--aiaCmdRejected">
          <div className="figma-ai-tw__snippetHeader">
            <div className="figma-ai-tw__snippetLeft">
              <span className="figma-ai-tw__snippetIcon">
                <img
                  className="figma-ai-tw__aiaCmdStatusIcon"
                  src={ideIcons.aiMessageCross}
                  alt=""
                  width={16}
                  height={16}
                />
              </span>
              <AiaSnippetCmdLine
                className="figma-ai-tw__snippetCmd"
                mono="npm init -y"
                highlight={AIA_CMD_HIGHLIGHT_NPM_INIT}
              >
                <span className="figma-ai-tw__aiaCmdStatusLabel figma-ai-tw__aiaCmdStatusLabel--rejected">
                  Rejected
                </span>
                <span className="figma-ai-tw__aiaCmdStatusCmd">npm init -y</span>
              </AiaSnippetCmdLine>
            </div>
            <div className="figma-ai-tw__snippetRight">
              <AiaDefaultSnippetActions
                completed
                expandLogId="fa-aia-showcase-rejected"
                onOpenInTab={() => {}}
              />
            </div>
          </div>
          <div className="figma-ai-tw__snippetOutline" aria-hidden />
        </div>
    </div>
  )
}

function FailedFeedRow() {
  return (
    <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd llm21607-terminal-state-column--completedHover">
        <div className="figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--aiaCmdFailed">
          <div className="figma-ai-tw__snippetHeader">
            <div className="figma-ai-tw__snippetLeft">
              <span className="figma-ai-tw__snippetIcon">
                <img
                  className="figma-ai-tw__aiaCmdStatusIcon"
                  src={ideIcons.aiMessageCross}
                  alt=""
                  width={16}
                  height={16}
                />
              </span>
              <AiaSnippetCmdLine
                className="figma-ai-tw__snippetCmd"
                mono="npm init -y"
                highlight={AIA_CMD_HIGHLIGHT_NPM_INIT}
              >
                <span className="figma-ai-tw__aiaCmdStatusLabel figma-ai-tw__aiaCmdStatusLabel--failed">
                  Failed
                </span>
                <span className="figma-ai-tw__aiaCmdStatusCmd">npm init -y</span>
              </AiaSnippetCmdLine>
            </div>
            <div className="figma-ai-tw__snippetRight">
              <AiaDefaultSnippetActions
                completed
                expandLogId="fa-aia-showcase-failed"
                onOpenInTab={() => {}}
              />
            </div>
          </div>
          <div className="figma-ai-tw__snippetOutline" aria-hidden />
        </div>
    </div>
  )
}

const MCP_STREAM_PREVIEW_LINES = [
  '[ijproxy] read_file .ai/local.md slice lines=1-200',
  'POST /mcp/tools/call HTTP/1.1 200 OK 18ms',
  '200 lines (18432 bytes)',
] as const

function McpInProgressFeedRow() {
  return (
    <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd">
      <div
        className="figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--aiaCmdMcp figma-ai-tw__snippet--aiaCmdInProgress"
        aria-busy
      >
        <div className="figma-ai-tw__snippetHeader">
          <div className="figma-ai-tw__snippetLeft figma-ai-tw__snippetLeft--aiaMcp">
            <span className="figma-ai-tw__snippetIcon figma-ai-tw__snippetIcon--aiaMcpPlugin">
              <IconMcp className="figma-ai-tw__aiaMcpIconSvg" aria-hidden />
            </span>
            <AiaSnippetCmdLine
              className="figma-ai-tw__snippetCmd figma-ai-tw__snippetCmd--aiaMcpLine figma-ai-tw__snippetCmd--aiaLoading"
              mono={`${AIA_MCP_READ_FILE_TOOL} ${AIA_MCP_READ_FILE_ARGS_PREVIEW}`}
            />
          </div>
          <div className="figma-ai-tw__snippetRight">
            <AiaDefaultSnippetActions completed={false} inProgress expandLogId="fa-aia-showcase-mcp-progress" />
          </div>
        </div>
        <CompactLogTail lines={MCP_STREAM_PREVIEW_LINES} reserveMinLines={3} />
        <div className="figma-ai-tw__snippetOutline" aria-hidden />
      </div>
    </div>
  )
}

/** Completed MCP read_file row — reusable in chat feeds and showcases. */
export function AiaCompletedMcpReadFileFeedRow({
  expandLogId = 'fa-aia-mcp-completed',
}: {
  expandLogId?: string
}) {
  return (
    <div className="figma-ai-tw__snippetWrap figma-ai-tw__snippetWrap--aiaCmd llm21607-terminal-state-column--completedHover">
      <div className="figma-ai-tw__snippet figma-ai-tw__snippet--aiaCmd figma-ai-tw__snippet--aiaCmdMcp figma-ai-tw__snippet--aiaCmdCompleted">
        <div className="figma-ai-tw__snippetHeader">
          <div className="figma-ai-tw__snippetLeft figma-ai-tw__snippetLeft--aiaMcp">
            <span className="figma-ai-tw__snippetIcon figma-ai-tw__snippetIcon--aiaMcpPlugin">
              <IconMcp className="figma-ai-tw__aiaMcpIconSvg" aria-hidden />
            </span>
            <AiaSnippetCmdLine
              className="figma-ai-tw__snippetCmd figma-ai-tw__snippetCmd--aiaMcpLine"
              mono={`${AIA_MCP_READ_FILE_TOOL} ${AIA_MCP_READ_FILE_ARGS_PREVIEW}`}
              highlight={AIA_CMD_HIGHLIGHT_MCP}
            >
              <span className="figma-ai-tw__aiaMcpToolName">{AIA_MCP_READ_FILE_TOOL}</span>
              <ShowcaseMcpArgsHoverTip>
                <button
                  type="button"
                  className="figma-ai-tw__aiaMcpArgsTrigger"
                  aria-label="Tool arguments (hover for full JSON)"
                >
                  {AIA_MCP_READ_FILE_ARGS_PREVIEW}
                </button>
              </ShowcaseMcpArgsHoverTip>
            </AiaSnippetCmdLine>
          </div>
          <div className="figma-ai-tw__snippetRight">
            <AiaDefaultSnippetActions completed expandLogId={expandLogId} onOpenInTab={() => {}} />
          </div>
        </div>
        <div className="figma-ai-tw__snippetOutline" aria-hidden />
      </div>
    </div>
  )
}

function McpCompletedFeedRow() {
  return <AiaCompletedMcpReadFileFeedRow expandLogId="fa-aia-showcase-mcp-completed" />
}

function StateTile({
  title,
  hint,
  children,
}: {
  title: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <article className="llm21607-state-tile">
      <header className="llm21607-state-tile__caption">
        <h3>{title}</h3>
      </header>
      {children}
      <footer className="llm21607-state-tile__footer">{hint}</footer>
    </article>
  )
}

function OverviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="llm21607-terminal-states__section">
      <header className="llm21607-terminal-states__sectionCaption">
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  )
}

function ShowcaseMcpJsonTooltipBody() {
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

function ShowcaseMcpArgsHoverTip({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    setPosition({
      top: triggerRect.bottom + 4,
      left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
    })
  }, [])

  useLayoutEffect(() => {
    if (!visible) return undefined
    updatePosition()
    const onScroll = () => updatePosition()
    window.addEventListener('resize', onScroll)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [visible, updatePosition])

  return (
    <span
      className="tooltip-trigger figma-ai-tw__aiaMcpTipTrigger"
      ref={triggerRef}
      onMouseEnter={() => {
        timeoutRef.current = setTimeout(() => setVisible(true), 500)
      }}
      onMouseLeave={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setVisible(false)
      }}
    >
      {children}
      {visible ? (
        <div
          ref={tooltipRef}
          className="figma-ai-tw__aiaMcpJsonTooltip"
          style={{ top: position.top, left: position.left }}
          role="tooltip"
        >
          <ShowcaseMcpJsonTooltipBody />
        </div>
      ) : null}
    </span>
  )
}

/** Terminal + MCP block states — frameless overview at tool-window feed width. */
export function AiaComposerTerminalBlockStatesShowcase() {
  const inProgress = useInProgressStream()

  return (
    <div className="llm21607-terminal-states">
      <header className="llm21607-terminal-states__intro">
        <h1>Terminal block states</h1>
      </header>

      <OverviewSection title="Terminal rows">
        <div className="llm21607-terminal-states__grid llm21607-terminal-states__grid--4">
          <StateTile
            title="In progress"
            hint={
              <p className="llm21607-state-tile__meta">
                {inProgress.running ? 'Streaming…' : 'Stream finished.'}{' '}
                <button type="button" className="llm21607-state-tile__replay" onClick={inProgress.restartStream}>
                  Replay
                </button>
              </p>
            }
          >
            <SnippetStage>
              <InProgressFeedRow streamLines={inProgress.streamLines} running={inProgress.running} />
            </SnippetStage>
          </StateTile>

          <StateTile title="Completed">
            <SnippetStage>
              <CompletedFeedRow />
            </SnippetStage>
          </StateTile>

          <StateTile title="Rejected">
            <SnippetStage>
              <RejectedFeedRow />
            </SnippetStage>
          </StateTile>

          <StateTile title="Failed">
            <SnippetStage>
              <FailedFeedRow />
            </SnippetStage>
          </StateTile>
        </div>
      </OverviewSection>

      <OverviewSection title="MCP rows">
        <div className="llm21607-terminal-states__grid llm21607-terminal-states__grid--2">
          <StateTile title="In progress">
            <SnippetStage>
              <McpInProgressFeedRow />
            </SnippetStage>
          </StateTile>

          <StateTile title="Completed">
            <SnippetStage>
              <McpCompletedFeedRow />
            </SnippetStage>
          </StateTile>
        </div>
      </OverviewSection>

      <OverviewSection title="Permissions in composer">
        <div className="llm21607-terminal-states__grid llm21607-terminal-states__grid--2">
          <StateTile title="npm init -y">
            <SnippetStage variant="composerPermission" size="composer">
              <WaitForUserInputNpmDock />
              <ComposerFieldMock />
            </SnippetStage>
          </StateTile>

          <StateTile title="ijproxy.read_file">
            <SnippetStage variant="composerPermission" size="composer">
              <WaitForUserInputMcpDock />
              <ComposerFieldMock />
            </SnippetStage>
          </StateTile>
        </div>
      </OverviewSection>
    </div>
  )
}
