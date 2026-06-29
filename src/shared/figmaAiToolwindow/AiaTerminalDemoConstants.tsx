/** Shared AIA terminal demo strings/highlights — no imports from FigmaAiToolwindow (avoids circular deps with WG panel). */

/** First default AIA terminal row — long on purpose for one-line ellipsis demo. */
export const AIA_DEFAULT_FIRST_CMD_MONO =
  "sed -n '1,200p' 'app/(dashboard)/team/[id]/page.tsx' 2>/dev/null || echo \"(no [id] page yet)\""

export const AIA_CMD_HIGHLIGHT_SED = (
  <>
    <span className="m o">sed</span>
    <span className="m"> </span>
    <span className="m p">-n</span>
    <span className="m"> </span>
    <span className="m s">'1,200p'</span>
    <span className="m"> </span>
    <span className="m s">'app/(dashboard)/team/[id]/page.tsx'</span>
    <span className="m"> </span>
    <span className="m p">2&gt;/dev/null</span>
    <span className="m"> </span>
    <span className="m p">||</span>
    <span className="m"> </span>
    <span className="m o">echo</span>
    <span className="m"> </span>
    <span className="m s">"(no [id] page yet)"</span>
  </>
)

/** Demo log when the `sed` row is expanded — raw stdout (monochrome terminal). */
export const AIA_FIRST_CMD_LOG_LINES = [
  "import type { Metadata } from 'next';",
  "import { Section } from '@/components/Section';",
  '',
  'export const metadata: Metadata = {',
  "  title: 'Team',",
  '};',
  '',
  'type TeamDashboardPageProps = {',
  '  params: Promise<{ id: string }>;',
  '};',
  '',
  'export default async function TeamDashboardPage({',
  '  params,',
  '}: TeamDashboardPageProps) {',
  '  const { id } = await params;',
  '',
  '  return <Section teamId={id} />;',
  '}',
] as const

/** While `sed` runs: stream the same stdout (not fake `sed:` debug lines). */
export const AIA_FIRST_ROW_WAIT_STREAM_LINES = AIA_FIRST_CMD_LOG_LINES.filter((line) => line.length > 0).slice(
  0,
  9,
)
