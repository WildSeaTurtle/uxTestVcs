/** SVG assets in `ide-web-demo/icons/` (Vite alias `@icons`). */
import addDarkUrl from '@icons/add.svg?url'
import chatModeUrl from '@icons/Chat mode icons.svg?url'
import checkmarkUrl from '@icons/checkmark.svg?url'
import commandCollapseUrl from '@icons/command-collapse.svg?url'
import commandExpandUrl from '@icons/command-expand.svg?url'
import commandMoreUrl from '@icons/command-more.svg?url'
import commandOpenUrl from '@icons/command-open.svg?url'
import contextUrl from '@icons/autoContextOn.svg?url'
import hideUrl from '@icons/hide.svg?url'
import historyUrl from '@icons/history.svg?url'
import moreVerticalUrl from '@icons/moreVertical.svg?url'
import sendUrl from '@icons/send.svg?url'
import reasoningUrl from '@icons/Agents/reasoning.svg?url'
import loaderAnimatedUrl from '@icons/Agents/Loader animated.svg?url'
import inputToolbarStopUrl from '@icons/Agents/Input/Toolbar/stop.svg?url'
import aiMessageCrossUrl from '@icons/AI Message/cross.svg?url'
import aiMessageTerminalUrl from '@icons/AI Message/terminal.svg?url'

export const ideIcons = {
  addDark: addDarkUrl,
  chatMode: chatModeUrl,
  checkmark: checkmarkUrl,
  commandCollapse: commandCollapseUrl,
  commandExpand: commandExpandUrl,
  commandMore: commandMoreUrl,
  commandOpen: commandOpenUrl,
  context: contextUrl,
  hide: hideUrl,
  history: historyUrl,
  loaderAnimated: loaderAnimatedUrl,
  moreVertical: moreVerticalUrl,
  reasoning: reasoningUrl,
  /** THINKING-WG toolcall rows + feed: failed command (AI Message set). */
  aiMessageCross: aiMessageCrossUrl,
  /** THINKING-WG toolcall rows + feed: succeeded / running command. */
  aiMessageTerminal: aiMessageTerminalUrl,
  send: sendUrl,
  /** Composer toolbar — agent still running (Thinking WG demo). */
  inputToolbarStop: inputToolbarStopUrl,
} as const
