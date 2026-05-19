import { FC, ReactNode, HTMLAttributes, InputHTMLAttributes, ButtonHTMLAttributes, CSSProperties } from 'react';

// Theme Provider
export interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps>;
export function useTheme(): ThemeContextValue;

// Badge
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  text?: string;
  color?: 'blue-secondary' | 'blue' | 'green-secondary' | 'green' | 'purple-secondary' | 'gray-secondary' | 'disabled';
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  className?: string;
}

export const Badge: FC<BadgeProps>;
export const BadgeNew: FC<Omit<BadgeProps, 'text' | 'color'>>;
export const BadgeBeta: FC<Omit<BadgeProps, 'text' | 'color'>>;
export const BadgeFree: FC<Omit<BadgeProps, 'text' | 'color'>>;
export const BadgeTrial: FC<Omit<BadgeProps, 'text' | 'color'>>;

// Banner
export interface BannerAction {
  label: string;
  onClick?: () => void;
  href?: string;
  type?: string;
}

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'error' | 'warning' | 'success';
  children?: ReactNode;
  showIcon?: boolean;
  actions?: BannerAction[];
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
}

export const Banner: FC<BannerProps>;

// Button
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  type?: 'primary' | 'secondary';
  size?: 'default' | 'slim';
  disabled?: boolean;
  children?: ReactNode;
}

export const Button: FC<ButtonProps>;

// Checkbox
export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
  hint?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: FC<CheckboxProps>;

// Dropdown
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options?: DropdownOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  layout?: 'vertical' | 'horizontal';
  labelWidth?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const Dropdown: FC<DropdownProps>;
export const Combobox: FC<DropdownProps>;

// EmptyState
export interface EmptyStateProps {
  explanation: string;
  actionText?: string;
  actionShortcut?: string;
  onAction?: () => void;
  helpText?: string;
  helpHref?: string;
  className?: string;
}

export const EmptyState: FC<EmptyStateProps>;

/** Row in {@link EditorAreaEmptyState} shortcut list */
export interface EditorAreaEmptyShortcutRow {
  label: string;
  shortcut?: string;
}

export interface EditorAreaEmptyStateProps {
  shortcuts?: EditorAreaEmptyShortcutRow[];
  /** Rendered as the final list row (label-only), after shortcut rows. */
  dropHint?: string;
  className?: string;
}

export const EditorAreaEmptyState: FC<EditorAreaEmptyStateProps>;
export const DEFAULT_EDITOR_EMPTY_SHORTCUTS_MAC: EditorAreaEmptyShortcutRow[];

// Icon
export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  forceTheme?: 'light' | 'dark';
}

export const Icon: FC<IconProps>;

// IconButton
export interface IconButtonProps {
  icon: string;
  size?: number;
  type?: 'action' | 'toggle';
  variant?: 'default' | 'mainToolbar';
  isActive?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}

export const IconButton: FC<IconButtonProps>;
/** Same component as IconButton — alias for tool-window / header toolbars. */
export const ToolbarIconButton: FC<IconButtonProps>;

// Input
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'default' | 'small';
  error?: boolean;
  invalid?: boolean;
  label?: string;
  layout?: 'vertical' | 'horizontal';
  labelWidth?: string;
}

export const Input: FC<InputProps>;

// Link
export interface LinkProps {
  children?: ReactNode;
  type?: 'default' | 'dropdown' | 'external';
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const Link: FC<LinkProps>;

// Loader
export interface LoaderProps {
  size?: number | 'small' | 'large';
  className?: string;
}

export const Loader: FC<LoaderProps>;

// Popup
export interface PopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
}

export const Popup: FC<PopupProps>;

export interface PopupCellProps {
  icon?: string;
  label: string;
  type?: 'default' | 'advanced' | 'footer';
  shortcut?: string;
  module?: string;
  moduleIcon?: string;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PopupCell: FC<PopupCellProps>;

// PositionedPopup
export interface PositionedPopupProps {
  triggerRect: { top?: number; bottom?: number; left?: number; right?: number; x?: number; y?: number } | DOMRect;
  onDismiss?: () => void;
  children?: ReactNode;
  gap?: number;
}

export const PositionedPopup: FC<PositionedPopupProps>;

// positionPopup utility
export interface AnchorRect {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  x?: number;
  y?: number;
}

export function positionPopup(popupEl: HTMLElement | null, anchor: AnchorRect | DOMRect, gap?: number): void;

// PopupProjects
export interface PopupProjectsProps {
  className?: string;
  style?: CSSProperties;
}

export const PopupProjects: FC<PopupProjectsProps>;

// PopupBranches
export interface PopupBranchesProps {
  style?: CSSProperties;
}

export const PopupBranches: FC<PopupBranchesProps>;

// PopupLineWithActions
export interface PopupLineWithActionsAction {
  icon: string;
  tooltip?: string;
  onClick?: () => void;
}

export interface PopupLineWithActionsProps {
  icon?: string;
  text: string;
  selected?: boolean;
  actions?: PopupLineWithActionsAction[];
  onClick?: () => void;
  className?: string;
}

export const PopupLineWithActions: FC<PopupLineWithActionsProps>;

// PopupRunWidget
export interface PopupRunWidgetProps {
  style?: CSSProperties;
  className?: string;
}

export const PopupRunWidget: FC<PopupRunWidgetProps>;

// PopupFindInFiles
export interface PopupFindInFilesResult {
  icon?: string;
  name: string;
  line: string;
  snippet: string;
}

export interface PopupFindInFilesProps {
  title?: string;
  matchSummary?: string;
  replaceField?: boolean;
  results?: PopupFindInFilesResult[];
  className?: string;
  style?: CSSProperties;
}

export const PopupFindInFiles: FC<PopupFindInFilesProps>;

// SearchEverywherePopup
export interface SearchEverywhereItem {
  type?: string;
  icon?: string;
  title: string;
  module?: string;
  moduleIcon?: string;
  shortcut?: string;
}
export interface SearchEverywhereTab {
  label: string;
}
export interface SearchEverywherePopupProps {
  tabs?: SearchEverywhereTab[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
  includeNonProject?: boolean;
  onIncludeNonProjectChange?: (value: boolean) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  items?: SearchEverywhereItem[];
  footerText?: string;
  className?: string;
  style?: React.CSSProperties;
}
export const SearchEverywherePopup: FC<SearchEverywherePopupProps>;

// ProgressBar
export interface ProgressBarProps {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  label?: string;
  showStopButton?: boolean;
  onStop?: () => void;
  className?: string;
}

export const ProgressBar: FC<ProgressBarProps>;

// Radio
export interface RadioProps {
  checked?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
  hint?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const Radio: FC<RadioProps>;

export interface RadioGroupOption {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options?: RadioGroupOption[];
  value?: string;
  name?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

export const RadioGroup: FC<RadioGroupProps>;

// Search
export interface SearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  showClose?: boolean;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  icon?: string;
  alwaysFocused?: boolean;
  className?: string;
}

export const Search: FC<SearchProps>;

// SegmentedControl
export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options?: SegmentedControlOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  focused?: boolean;
  className?: string;
}

export const SegmentedControl: FC<SegmentedControlProps>;

// Table
export interface TableColumn {
  key: string;
  title?: ReactNode;
  width?: string | number;
  icon?: string | (() => ReactNode);
  render?: (value: any, row: any, rowIndex: number) => ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  showToolbar?: boolean;
  toolbarActions?: any[];
  onAdd?: () => void;
  onRemove?: () => void;
  disableRemove?: boolean;
  editable?: boolean;
  onCellChange?: (rowIndex: number, columnKey: string, value: any) => void;
  striped?: boolean;
  selectedRowIndex?: number | null;
  onRowClick?: (row: any, rowIndex: number) => void;
  className?: string;
}

export const Table: FC<TableProps>;

// Toggle
export interface ToggleProps {
  checked?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export const Toggle: FC<ToggleProps>;

// Alert
export interface AlertButton {
  children?: ReactNode;
  type?: 'primary' | 'secondary';
  disabled?: boolean;
}

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  body?: ReactNode;
  type?: 'question' | 'error' | 'warning';
  buttons?: (string | AlertButton)[];
  showCheckbox?: boolean;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  onButtonClick?: (button: string | AlertButton, index: number) => void;
  className?: string;
  /** When true, renders the alert in inactive state (loses focus to another window). Mirrors macOS chrome — primary button takes secondary appearance. */
  inactive?: boolean;
}

export const Alert: FC<AlertProps>;

// Dialog
export interface DialogButtonConfig {
  children?: ReactNode;
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
}

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  width?: number | string;
  height?: number | string;
  showMacOSButtons?: boolean;
  showHelp?: boolean;
  onHelpClick?: () => void;
  buttons?: DialogButtonConfig[];
  leftContent?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** When true, renders the dialog in inactive state (loses focus to another window). Mirrors macOS chrome — traffic lights become uniform grey, primary button takes secondary appearance, and selected tree row uses inactive selection background. */
  inactive?: boolean;
}

export const Dialog: FC<DialogProps>;

export interface DialogHeaderProps {
  title?: string;
  showMacOSButtons?: boolean;
  className?: string;
}

export const DialogHeader: FC<DialogHeaderProps>;

export interface DialogFooterProps {
  showHelp?: boolean;
  onHelpClick?: () => void;
  buttons?: DialogButtonConfig[];
  leftContent?: ReactNode;
  className?: string;
}

export const DialogFooter: FC<DialogFooterProps>;

export interface DialogGroupHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  className?: string;
}

export const DialogGroupHeader: FC<DialogGroupHeaderProps>;

// WelcomeDialog (full props defined further below — see WelcomeProject / WelcomeNavItem)

// SettingsDialog
export interface SettingsTreeItem {
  id: string;
  label: string;
  hasChildren?: boolean;
  expanded?: boolean;
  children?: SettingsTreeItem[];
}

export interface SettingsDialogProps {
  title?: string;
  width?: number;
  height?: number;
  treeItems?: SettingsTreeItem[];
  buttons?: Array<{ children: ReactNode; onClick?: () => void; disabled?: boolean; type?: string }>;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
  /** When true, renders the dialog in inactive state (loses focus to another window). See DialogProps.inactive. */
  inactive?: boolean;
}

export const SettingsDialog: FC<SettingsDialogProps>;
export const DEFAULT_SETTINGS_TREE_ITEMS: SettingsTreeItem[];

// Tooltip
export interface TooltipProps {
  children: ReactNode;
  text?: string;
  shortcut?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  alwaysVisible?: boolean;
  className?: string;
}

export const Tooltip: FC<TooltipProps>;

// TooltipEditor
export interface TooltipEditorProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'error' | 'warning' | 'success';
  arrow?: 'up' | 'down' | 'left' | 'right';
  header?: string;
  text?: string;
  hint?: string;
  menu?: boolean;
  className?: string;
}

export const TooltipEditor: FC<TooltipEditorProps>;

// TooltipHelp
export interface TooltipHelpLink {
  text: string;
  href?: string;
  external?: boolean;
}

export interface TooltipHelpProps extends HTMLAttributes<HTMLDivElement> {
  header?: string;
  body?: ReactNode;
  shortcut?: string;
  link?: TooltipHelpLink;
  className?: string;
}

export const TooltipHelp: FC<TooltipHelpProps>;

// ValidationTooltip
export interface ValidationTooltipAction {
  label: string;
  onClick?: () => void;
}

export interface ValidationTooltipProps extends HTMLAttributes<HTMLDivElement> {
  text: string;
  type?: 'error' | 'warning';
  actions?: ValidationTooltipAction[];
  className?: string;
}

export const ValidationTooltip: FC<ValidationTooltipProps>;

// GotItTooltip
export interface GotItTooltipProps extends HTMLAttributes<HTMLDivElement> {
  header?: string;
  children?: ReactNode;
  step?: string;
  link?: string;
  linkHref?: string;
  buttonText?: string;
  skipText?: string;
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right';
  onGotIt?: () => void;
  onSkip?: () => void;
  className?: string;
}

export const GotItTooltip: FC<GotItTooltipProps>;

// Notification
export interface NotificationAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface NotificationProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'error' | 'warning' | 'success';
  title?: string;
  children?: ReactNode;
  button?: { label: string; onClick?: () => void };
  actions?: NotificationAction[];
  timestamp?: string;
  onClose?: () => void;
  onMore?: () => void;
  forceHoverButtons?: boolean;
  className?: string;
}

export const Notification: FC<NotificationProps>;

// Editor
export interface ReaderModeTooltip {
  title?: string;
  body?: string;
  linkText?: string;
}

export interface EditorProps extends HTMLAttributes<HTMLDivElement> {
  code?: string;
  language?: string;
  showLineNumbers?: boolean;
  readOnly?: boolean;
  showReaderMode?: boolean;
  readerModeLabel?: string;
  readerModeTooltip?: ReaderModeTooltip;
  onChange?: (code: string) => void;
  onExitReaderMode?: () => void;
  breakpoints?: number[];
  onBreakpointToggle?: (line: number) => void;
  gutterActions?: any[];
  /** ReactNode rendered above the gutter+code area, spanning the full editor width.
   *  Use for input bars, banners, or any content that sits above the code.
   *  Example: a Claude task input bar above an empty markdown editor. */
  topBar?: ReactNode;
  /** When set, replaces gutter + Prism editor with this content (e.g. tool window UI in the editor area). */
  embeddedContent?: ReactNode;
  className?: string;
}

export const Editor: FC<EditorProps>;

// Layout Components
export const IDEWindow: FC<{ children?: ReactNode; className?: string }>;

export type TabDragKind = 'editor-tab' | 'toolwindow-tab' | 'toolwindow-hosted-in-editor';
export type TabMoveTarget = 'editor' | 'origin-toolwindow';
export type TabSurfaceType = 'editor' | 'toolwindow';

export interface TabDragMetadata {
  dragKind?: TabDragKind;
  originSurfaceId?: string;
  canMoveTo?: TabMoveTarget[];
}

export interface SharedTabDef extends TabDragMetadata {
  id?: string;
  label: string;
  icon?: string | ReactNode;
  count?: number;
  closable?: boolean;
  disabled?: boolean;
}

export interface TabReorderEvent {
  tabId: string;
  tab: SharedTabDef;
  fromIndex: number;
  toIndex: number;
  surfaceId: string;
}

export interface TabMoveEvent {
  tabId: string;
  tab: SharedTabDef;
  dragKind?: TabDragKind;
  originSurfaceId?: string;
  fromSurfaceId: string;
  fromSurfaceType?: TabSurfaceType;
  toSurfaceId: string;
  toSurfaceType?: TabSurfaceType;
  fromIndex: number;
  toIndex: number;
}

export interface EditorTabDef extends TabDragMetadata {
  /** Unique identifier — used as key for editorTabContents lookup */
  id: string;
  label: string;
  /** Icon name from the registry, e.g. 'fileTypes/java', 'fileTypes/markdown' */
  icon?: string;
  closable?: boolean;
}

/** Per-tab editor content bound to an EditorTabDef by id.
 *  Provide in editorTabContents to show different code/language/topBar per tab. */
export interface EditorTabContent {
  /** Source code to display in the editor for this tab */
  code?: string;
  /** Prism language identifier, e.g. 'java', 'markdown', 'javascript', 'css' */
  language?: string;
  /** ReactNode rendered above the code area for this tab only.
   *  Use for input bars, banners, or contextual toolbars. */
  topBar?: ReactNode;
  /** Forwarded to Editor. When set, the tab shows embedded UI instead of the code editor (e.g. hosting a tool window in the editor area). */
  embeddedContent?: ReactNode;
  /** Forwarded to Editor. Default: false */
  readOnly?: boolean;
  /** Forwarded to Editor. Default: true */
  showLineNumbers?: boolean;
  /** Forwarded to Editor. Omit to derive from readOnly (Reader Mode badge when read-only). */
  showReaderMode?: boolean;
  /** Forwarded to Editor root `className` (e.g. layout tweaks for non-code tabs). */
  editorClassName?: string;
}

export interface TreeNodeData {
  /** Stable ID used for selection and callbacks. If omitted, an ID is auto-generated
   *  from position (e.g. "1-0"). Provide an explicit id on any node you want to
   *  reference via defaultSelectedNodeId or onNodeSelect. */
  id?: string;
  label: string;
  /** Icon name from the registry (e.g. "nodes/folder", "fileTypes/markdown") or a ReactNode */
  icon?: string | ReactNode;
  /** Trailing secondary text — shown right-aligned, muted (e.g. a file path or timestamp) */
  secondaryText?: string;
  /** Whether this node starts expanded. Default: false */
  isExpanded?: boolean;
  /** Child nodes — omit for leaf nodes */
  children?: TreeNodeData[];
}

export interface StripeItemDef {
  id: string;
  icon?: string | ReactNode;
  /** When true, strips color from a custom ReactNode icon so it matches the
   *  built-in icon appearance (greyscale in default/inactive, white when selected).
   *  Has no effect on string-based icons from the registry (they already use currentColor). */
  monochrome?: boolean;
  tooltip?: string;
  section?: 'top' | 'bottom';
  panel?: 'bottom';
  separator?: boolean;
}

/** Shape of a single terminal tab managed by MainWindow */
export interface TerminalTabDef extends TabDragMetadata {
    id?: string;
    label: string;
    icon?: string;
    count?: number;
    closable?: boolean;
}

/** macOS multi-project tab row — prefer `label` (full window title); `name` is a fallback */
export interface ProjectTabDef {
  id?: string;
  label?: string;
  name?: string;
    closable?: boolean;
    /** Legacy — not shown in the macOS Projects Tab Bar (text-only per Figma) */
    icon?: string;
  color?: string;
}

export type ToolWindowLayoutMode = 'standalone' | 'docked';

/** Context object passed as the second argument to leftPanelContent,
 *  rightPanelContent, and bottomPanelContent renderers. */
export interface PanelContext {
  projectName: string;
  projectTreeData: TreeNodeData[];
  defaultSelectedNodeId?: string;
  /** Which area currently has keyboard focus */
  focusedPanel: 'editor' | 'left' | 'right' | 'bottom';
  setFocusedPanel: (panel: 'editor' | 'left' | 'right' | 'bottom') => void;
  /** Closes the left sub-panel this renderer is inside (top or split section) */
  setShowLeftPanel: (show: boolean) => void;
  setShowRightPanel: (show: boolean) => void;
  setShowBottomPanel: (show: boolean) => void;
  terminalTabs: TerminalTabDef[];
  activeTerminalTab: number;
  setActiveTerminalTab: (index: number) => void;
  handleTerminalTabClose: (index: number) => void;
  handleTerminalTabAdd: () => void;
  /** Docked panel renderers should pass this into ToolWindow-based content. */
  toolWindowLayoutMode: ToolWindowLayoutMode;
}

export interface MainWindowProps {
  /** Project name shown in the toolbar dropdown. Default: "intellij" */
  projectName?: string;
  /** 1–2 letter initials shown in the project icon badge. Default: "IJ" */
  projectIcon?: string;
  /** Built-in project accent color. Default: "cobalt".
   *  Options: 'cobalt' | 'violet' | 'grass' | 'ocean' | 'sky' | 'amber' | 'rust' | 'olive' | 'plum' */
  projectColor?: string;
  /** Git branch name shown in the toolbar. Default: "main" */
  branchName?: string;
  /** Run configuration name shown in the run widget. Default: "IDEA Community" */
  runConfig?: string;
  /** State of the run widget. Default: "default" */
  runState?: 'default' | 'running' | 'debugging';
  /** Editor tab definitions. Default: DEFAULT_EDITOR_TABS (5 Java/SVG tabs) */
  editorTabs?: EditorTabDef[];
  /** Index of the active editor tab. Uncontrolled if omitted. */
  activeEditorTab?: number;
  /** Called when the user clicks a tab. */
  onEditorTabChange?: (index: number) => void;
  /** Called when the user closes a tab. */
  onEditorTabClose?: (index: number) => void;
  /** Called when the user drags an editor tab within the editor strip. */
  onEditorTabReorder?: (event: TabReorderEvent) => void;
  /** Called when the user drops a compatible tab into the editor strip. */
  onEditorTabMove?: (event: TabMoveEvent) => void;
  /** Enables drag reordering inside the editor tab bar. */
  editorTabsReorderable?: boolean;
  /** Stable surface id used for cross-surface tab dragging. Default: "main-window-editor". */
  editorSurfaceId?: string;
  /** Code shown in the editor when editorTabContents is not provided.
   *  Default: DEFAULT_JAVA_CODE (Apache Commons Math sample) */
  editorCode?: string;
  /** Prism language for syntax highlighting when editorTabContents is not provided.
   *  Default: "java". Common values: 'java' | 'javascript' | 'typescript' | 'markdown' | 'css' */
  editorLanguage?: string;
  /** Called when the user edits code. */
  onEditorCodeChange?: (code: string) => void;
  /** Per-tab editor content keyed by EditorTabDef.id.
   *  When provided, the active tab's entry determines code, language, and topBar.
   *  Falls back to editorCode / editorLanguage / editorTopBar for tabs not in the map.
   *  Export DEFAULT_EDITOR_TAB_CONTENTS for sensible defaults matching DEFAULT_EDITOR_TABS. */
  editorTabContents?: Record<string, EditorTabContent>;
  /** ReactNode rendered above the code area in the editor, spanning gutter and content.
   *  Use for input bars, banners, or contextual toolbars.
   *  When editorTabContents is used, each tab can have its own topBar instead. */
  editorTopBar?: ReactNode;
  /** When `editorTabs` is empty, replaces the default centered shortcut list and drop hint. */
  editorEmptyState?: ReactNode;
  /** When `editorTabs` is empty, shortcut rows for the default empty UI (default: `DEFAULT_EDITOR_EMPTY_SHORTCUTS_MAC`). */
  editorEmptyShortcuts?: EditorAreaEmptyShortcutRow[];
  /** When `editorTabs` is empty, text below the shortcut rows (default: “Drop files here to open them”). */
  editorEmptyDropHint?: string;
  /** File tree data for the built-in Project tool window.
   *  Default: DEFAULT_PROJECT_TREE_DATA (sample intellij project). */
  projectTreeData?: TreeNodeData[];
  /** ID of the tree node that should appear selected on first render.
   *  Only nodes with an explicit id field can be targeted. */
  defaultSelectedNodeId?: string;
  /** Stripe button items for the left sidebar. Default: DEFAULT_LEFT_STRIPE_ITEMS.
   *  Add a separator item to split the left panel into top and bottom sub-panels. */
  leftStripeItems?: StripeItemDef[];
  /** Stripe button items for the right sidebar. Default: DEFAULT_RIGHT_STRIPE_ITEMS. */
  rightStripeItems?: StripeItemDef[];
  /** Stripe button items shown at the bottom of the left sidebar.
   *  Items with panel:"bottom" route to the bottom panel. Default: DEFAULT_BOTTOM_STRIPE_ITEMS. */
  bottomStripeItems?: StripeItemDef[];
  /** Custom renderer for the left tool window panel.
   *  Receives the active stripe item id and a PanelContext.
   *  Call defaultLeftPanelContent(id, ctx) to delegate to built-in renderers for unknown ids. */
  leftPanelContent?: (stripeId: string, context: PanelContext) => ReactNode;
  /** Custom renderer for the right tool window panel.
   *  Call defaultRightPanelContent(id, ctx) for built-in fallback. */
  rightPanelContent?: (stripeId: string, context: PanelContext) => ReactNode;
  /** Custom renderer for the bottom tool window panel.
   *  Call defaultBottomPanelContent(id, ctx) for built-in fallback. */
  bottomPanelContent?: (stripeId: string, context: PanelContext) => ReactNode;
  /** IDs of stripe items that should be open on first render.
   *  Default: ['project', 'terminal'] */
  defaultOpenToolWindows?: string[];
  /** Initial width in pixels for the left tool-window column in uncontrolled mode. Default: 280. */
  initialLeftPanelWidth?: number;
  /** Initial width in pixels for the right tool-window panel in uncontrolled mode. Default: 320. */
  initialRightPanelWidth?: number;
  /** Initial height in pixels for the bottom tool-window panel in uncontrolled mode. Default: 180. */
  initialBottomPanelHeight?: number;
  /** Controlled width in pixels for the left tool-window column. */
  leftPanelWidth?: number;
  /** Controlled width in pixels for the right tool-window panel. */
  rightPanelWidth?: number;
  /** Controlled height in pixels for the bottom tool-window panel. */
  bottomPanelHeight?: number;
  /** Called when the left panel width changes via drag or responsive clamping. */
  onLeftPanelWidthChange?: (width: number) => void;
  /** Called when the right panel width changes via drag or responsive clamping. */
  onRightPanelWidthChange?: (width: number) => void;
  /** Called when the bottom panel height changes via drag or responsive clamping. */
  onBottomPanelHeightChange?: (height: number) => void;
  /** Minimum width in pixels for the left panel. Default: 220. */
  minLeftPanelWidth?: number;
  /** Maximum width in pixels for the left panel. Defaults to the current shell space minus the minimum editor width. */
  maxLeftPanelWidth?: number;
  /** Minimum width in pixels for the right panel. Default: 260. */
  minRightPanelWidth?: number;
  /** Maximum width in pixels for the right panel. Defaults to the current shell space minus the minimum editor width. */
  maxRightPanelWidth?: number;
  /** Minimum height in pixels for the bottom panel. Default: 140. */
  minBottomPanelHeight?: number;
  /** Maximum height in pixels for the bottom panel. Defaults to the current shell space minus the minimum top-row height. */
  maxBottomPanelHeight?: number;
  /** Replaces the entire main toolbar with a custom ReactNode.
   *  Omit to use the built-in MainToolbar with project/branch/run widgets. */
  toolbar?: ReactNode;
  /** When set and non-empty, shows the macOS-style projects tab bar below the main toolbar. */
  projectTabs?: ProjectTabDef[];
  /** Active project tab index. Omit for uncontrolled mode. */
  activeProjectTab?: number;
  onProjectTabChange?: (index: number) => void;
  /** When provided, tabs may show a close control (hover) that calls this handler. */
  onProjectTabClose?: (index: number) => void;
  /** Status bar configuration. Omit to use the built-in default breadcrumbs and widgets. */
  statusBarProps?: StatusBarProps;
  /** Overlay content (modals, popups). Omit to use the built-in Search Everywhere and Settings overlays. */
  overlays?: ReactNode;
  /** When set, called instead of opening the built-in Search Everywhere overlay (e.g. custom `overlays`). */
  onSearchEverywhere?: () => void;
  /** When set, called instead of opening the built-in Settings overlay (e.g. custom non-modal Settings). */
  onSettings?: () => void;
  /** Height of the window. Pass a number for pixels (default: 800) or a CSS string like '100%' or '100vh'.
   *  The parent element must have a height for percentage values to work. */
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

export const MainWindow: FC<MainWindowProps>;

export interface MacOsProjectsTabBarProps {
    tabs?: ProjectTabDef[];
    activeTab?: number;
    onTabChange?: (index: number) => void;
    onTabClose?: (index: number) => void;
    /** Horizontal padding for the macOS traffic-light region (default 41). */
    trafficLightsPadding?: number;
    className?: string;
}
export const MacOsProjectsTabBar: FC<MacOsProjectsTabBarProps>;
export const DEFAULT_EDITOR_TABS: EditorTabDef[];
/** Per-tab content matching DEFAULT_EDITOR_TABS — different code and language per tab.
 *  Pass as editorTabContents to get distinct content for each default tab. */
export const DEFAULT_EDITOR_TAB_CONTENTS: Record<string, EditorTabContent>;
export const DEFAULT_JAVA_CODE: string;
export const DEFAULT_PROJECT_TREE_DATA: TreeNodeData[];
export const DEFAULT_LEFT_STRIPE_ITEMS: StripeItemDef[];
export const DEFAULT_RIGHT_STRIPE_ITEMS: StripeItemDef[];
export const DEFAULT_BOTTOM_STRIPE_ITEMS: StripeItemDef[];
export const DEFAULT_OPEN_TOOL_WINDOWS: string[];
export function defaultLeftPanelContent(stripeId: string, context: PanelContext): ReactNode;
export function defaultRightPanelContent(stripeId: string, context: PanelContext): ReactNode;
export function defaultBottomPanelContent(stripeId: string, context: PanelContext): ReactNode;

// Navigation Components
export const Tab: FC<{ label: string; icon?: string | ReactNode; count?: number; active?: boolean; focused?: boolean; disabled?: boolean; closable?: boolean; onClick?: () => void; onClose?: () => void; className?: string }>;
export const TabBar: FC<{
  tabs?: SharedTabDef[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
  onTabClose?: (index: number) => void;
  onTabReorder?: (event: TabReorderEvent) => void;
  onTabMove?: (event: TabMoveEvent) => void;
  focused?: boolean;
  direction?: 'horizontal' | 'vertical';
  wrap?: boolean;
  actions?: string[];
  onActionClick?: (action: string) => void;
  className?: string;
  reorderable?: boolean;
  surfaceId?: string;
  surfaceType?: TabSurfaceType;
}>;
export const StripeIconButton: FC<{ icon?: string | ReactNode; monochrome?: boolean; label?: string; state?: 'default' | 'selected' | 'inactive'; badge?: boolean; disabled?: boolean; title?: string; onClick?: () => void }>;
export const StripeContainer: FC<{ children?: ReactNode; position?: 'left' | 'right' }>;

// Toolbar Components (regular — 26px, for tool-window toolbars)
// Use these inside toolbarExtra, Editor topBar, or any custom bar that lives inside an IDE window.
// Never use raw <button> elements — toolbar components carry correct sizing, states, and spacing tokens.

/** 26px toolbar button. Use inside any IDE toolbar area (toolbarExtra, Editor topBar, etc.).
 *  NOTE: shortcut display is a known gap — there is no shortcut prop that renders the key
 *  inline next to the label (e.g. "Send  ↵"). Workaround: include the key text in `text`.
 *  This is tracked as a library feature request. */
export const ToolbarButton: FC<{ text?: string; icon?: string | ReactNode; showChevron?: boolean; disabled?: boolean; onClick?: () => void; className?: string }>;
export const ToolbarSeparator: FC<{ orientation?: 'vertical' | 'horizontal'; className?: string }>;
export const ToolbarDropdown: FC<{ text?: string; label?: string; icon?: string; theme?: 'dark' | 'light' | 'light-header'; disabled?: boolean; onClick?: () => void; className?: string }>;

// Main Toolbar Components (40px, for the main application toolbar)
export interface MainToolbarProps {
  projectName?: string;
  projectIcon?: string;
  projectColor?: string;
  branchName?: string;
  runConfig?: string;
  runState?: 'default' | 'running' | 'debugging';
  leftExtra?: ReactNode;
  rightActions?: ReactNode | Array<{ icon: string; tooltip?: string; onClick?: () => void }>;
  showWindowControls?: boolean;
  onSearchEverywhere?: () => void;
  onSettings?: () => void;
  className?: string;
}
export const MainToolbar: FC<MainToolbarProps>;
export const MainToolbarIconButton: FC<Omit<IconButtonProps, 'variant'>>;
export const MainToolbarDropdown: FC<{ text?: string; label?: string; icon?: string | ReactNode; disabled?: boolean; onClick?: () => void; className?: string }>;
export const MainToolbarVerticalSeparator: FC<{}>;
export const ProjectWidget: FC<{ projectName: string; projectIcon?: string; disabled?: boolean; onClick?: () => void }>;

// RunWidget
export interface RunWidgetProps {
  state?: 'default' | 'running' | 'debugging';
  runConfig?: string;
  configIcon?: string;
  onRun?: () => void;
  onDebug?: () => void;
  onStop?: () => void;
  onRerun?: () => void;
  onRestartDebug?: () => void;
  onMore?: () => void;
  onDropdownClick?: () => void;
  className?: string;
}

export const RunWidget: FC<RunWidgetProps>;

// Status Bar Components
export interface StatusBarBreadcrumbItem {
  label: string;
  icon?: boolean;
  iconName?: string;
  module?: boolean;
  state?: string;
  onClick?: () => void;
}

export interface StatusBarWidgetItem {
  type: 'text' | 'icon';
  text?: string;
  iconName?: string;
  state?: string;
  onClick?: () => void;
}

export interface StatusBarProps {
  progress?: boolean;
  progressLabel?: string;
  progressValue?: number;
  onProgressStop?: () => void;
  breadcrumbs?: StatusBarBreadcrumbItem[];
  widgets?: StatusBarWidgetItem[];
  className?: string;
}

export const StatusBar: FC<StatusBarProps>;
export const DEFAULT_BREADCRUMBS: StatusBarBreadcrumbItem[];
export const DEFAULT_WIDGETS: StatusBarWidgetItem[];
export const StatusBarBreadcrumb: FC<{ items?: any[]; className?: string }>;
export const StatusBarProgress: FC<{ label?: string; value?: number; indeterminate?: boolean }>;
export const StatusBarWidget: FC<{ icon?: string; label?: string; onClick?: () => void }>;

// Tool Window Components
export interface ToolWindowProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  width?: number | string;
  height?: number | string;
  /** "docked" fills the parent shell and ignores width/height props. */
  layoutMode?: ToolWindowLayoutMode;
  headerType?: 'label' | 'tabs';
  tabs?: SharedTabDef[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
  onTabReorder?: (event: TabReorderEvent) => void;
  onTabMove?: (event: TabMoveEvent) => void;
  showSeparator?: boolean;
  actions?: string[];
  onActionClick?: (action: string, payload?: unknown) => void;
  focused?: boolean;
  onFocus?: () => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  toolbarExtra?: ReactNode;
  /** After ⋯ and hide — rightmost header controls (e.g. Open as Editor Tab). */
  toolbarTrailing?: ReactNode;
  tabBarDropdown?: boolean;
  reorderableTabs?: boolean;
  tabSurfaceId?: string;
  tabSurfaceType?: TabSurfaceType;
  /** Omit header row; render body only (e.g. editor-embedded tool content). */
  hideHeader?: boolean;
}

export const ToolWindow: FC<ToolWindowProps>;
export const ToolWindowHeader: FC<{
  title?: string;
  icon?: string;
  type?: 'label' | 'tabs';
  tabs?: SharedTabDef[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
  onTabReorder?: (event: TabReorderEvent) => void;
  onTabMove?: (event: TabMoveEvent) => void;
  actions?: string[];
  showSeparator?: boolean;
  dropdown?: boolean;
  onActionClick?: (action: string, payload?: unknown) => void;
  focused?: boolean;
  toolbarExtra?: ReactNode;
  toolbarTrailing?: ReactNode;
  tabBarDropdown?: boolean;
  reorderableTabs?: boolean;
  tabSurfaceId?: string;
  tabSurfaceType?: TabSurfaceType;
}>;
/** A single button in the TerminalWindow or ProblemsWindow sidebar toolbar */
export interface SidebarToolbarButton {
  icon: string;
  tooltip: string;
  onClick?: () => void;
}

/** Row in TerminalWindow tab/header right-click menu (Popup line or separator). */
export interface TerminalHeaderContextMenuItem {
  label?: string;
  type?: 'separator';
  icon?: string;
  shortcut?: string;
  submenu?: boolean;
  selected?: boolean;
  onClick?: (item: TerminalHeaderContextMenuItem) => void;
}

export interface TerminalWindowProps {
  title?: string;
  width?: number | string;
  height?: number | string;
  layoutMode?: ToolWindowLayoutMode;
  /** Terminal session tabs. Default: [{ label: 'Local', closable: true }] */
  tabs?: TerminalTabDef[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
  onTabAdd?: () => void;
  onTabClose?: (index: number) => void;
  onTabReorder?: (event: TabReorderEvent) => void;
  onTabMove?: (event: TabMoveEvent) => void;
  actions?: string[];
  onActionClick?: (action: string, payload?: unknown) => void;
  /** Command blocks to display. Each: { path, lines: [{type, text}] } */
  blocks?: Array<{ path: string; lines?: Array<{ type: string; text: string; href?: string }> }>;
  /** Input prompt config. Pass null to hide the input row. */
  input?: { path: string; branch?: string; ghost?: string } | null;
  showSearch?: boolean;
  focused?: boolean;
  onCommand?: (command: string) => void;
  /** Buttons rendered in a vertical sidebar on the RIGHT side of the terminal.
   *  Follows the same pattern as ProblemsWindow's left sidebar toolbar.
   *  Renders a 35px column with border-left, identical sizing to Problems. */
  toolbarButtons?: SidebarToolbarButton[];
  /** Forwarded to ToolWindow (leading, before ⋯ / hide). */
  toolbarExtra?: ReactNode;
  /** Forwarded to ToolWindow — after ⋯ / hide (e.g. Open as Editor Tab). */
  toolbarTrailing?: ReactNode;
  /** Replaces the default tab/header right-click menu when set (including []). */
  headerContextMenuItems?: TerminalHeaderContextMenuItem[];
  /** Inserted after "Move to Editor" when headerContextMenuItems is unset. */
  extraHeaderContextMenuItems?: TerminalHeaderContextMenuItem[];
  /** Inserted after the first separator in the ⋯ More menu. */
  extraMoreMenuItems?: TerminalHeaderContextMenuItem[];
  /** Fired when any header context menu item is activated. */
  onHeaderContextMenuAction?: (item: TerminalHeaderContextMenuItem) => void;
  /** Hide tool window header; terminal buffer + input only (e.g. editor tab). */
  contentOnly?: boolean;
  reorderableTabs?: boolean;
  tabSurfaceId?: string;
  tabSurfaceType?: TabSurfaceType;
  className?: string;
}

export const TerminalWindow: FC<TerminalWindowProps>;

export interface ProjectWindowProps {
  title?: string;
  width?: number | string;
  height?: number | string;
  layoutMode?: ToolWindowLayoutMode;
  treeData?: TreeNodeData[];
  defaultSelectedId?: string;
  actions?: string[];
  onNodeSelect?: (id: string, selected: boolean) => void;
  onNodeToggle?: (id: string, expanded: boolean) => void;
  focused?: boolean;
  onFocus?: () => void;
  onActionClick?: (action: string, payload?: unknown) => void;
  className?: string;
  toolbarExtra?: ReactNode;
}

export const ProjectWindow: FC<ProjectWindowProps>;

export interface AIAssistantWindowProps {
  title?: string;
  width?: number | string;
  height?: number | string;
  layoutMode?: ToolWindowLayoutMode;
  messages?: any[];
  placeholder?: string;
  empty?: boolean;
  actions?: string[];
  contentOnly?: boolean;
  focused?: boolean;
  onFocus?: () => void;
  onActionClick?: (action: string, payload?: unknown) => void;
  className?: string;
  toolbarExtra?: ReactNode;
}

export const AIAssistantWindow: FC<AIAssistantWindowProps>;

// ProblemsWindow
export interface ProblemsWindowProps {
  title?: string;
  width?: number | string;
  height?: number | string;
  layoutMode?: ToolWindowLayoutMode;
  tabs?: any[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
  onActionClick?: (action: string, payload?: unknown) => void;
  treeData?: TreeNodeData[];
  empty?: boolean;
  emptyText?: string;
  actions?: string[];
  /** Left sidebar toolbar buttons. Default: Preview, Show Quick-Fixes, Settings.
   *  Uses the same SidebarToolbarButton shape as TerminalWindow.toolbarButtons. */
  toolbarButtons?: SidebarToolbarButton[];
  focused?: boolean;
  className?: string;
}

export const ProblemsWindow: FC<ProblemsWindowProps>;
/** Default Problems sidebar toolbar: Preview, Show Quick-Fixes, Settings */
export const DEFAULT_PROBLEMS_TOOLBAR_BUTTONS: SidebarToolbarButton[];

// ServicesWindow
export interface ServicesToolbarItem {
  icon?: string;
  tooltip?: string;
  onClick?: () => void;
  type?: 'separator';
}

export interface ServicesWindowProps {
  title?: string;
  width?: number | string;
  height?: number | string;
  layoutMode?: ToolWindowLayoutMode;
  treeData?: TreeNodeData[];
  defaultSelectedId?: string;
  detailEmptyText?: string;
  leftToolbar?: ServicesToolbarItem[];
  rightToolbar?: ServicesToolbarItem[];
  actions?: string[];
  onActionClick?: (action: string, payload?: unknown) => void;
  focused?: boolean;
  className?: string;
  /** Leading header extras after Locate (before ⋯ / hide). */
  toolbarExtra?: ReactNode;
  /** After ⋯ / hide — rightmost (e.g. Open as Editor Tab). */
  toolbarTrailing?: ReactNode;
  /** Rendered above the master-detail body (e.g. prototype banner). */
  contentTop?: ReactNode;
  hideHeader?: boolean;
}

export const ServicesWindow: FC<ServicesWindowProps>;
export const DEFAULT_SERVICES_TREE_DATA: TreeNodeData[];
export const DEFAULT_SERVICES_LEFT_TOOLBAR: ServicesToolbarItem[];
export const DEFAULT_SERVICES_RIGHT_TOOLBAR: ServicesToolbarItem[];

// CommitWindow
/** Toolbar button for CommitWindow's horizontal toolbar row.
 *  Identical shape to SidebarToolbarButton — kept separate for naming clarity. */
export interface CommitToolbarButton {
  icon: string;
  tooltip?: string;
  onClick?: () => void;
}

export interface CommitWindowProps {
  title?: string;
  width?: number | string;
  height?: number | string;
  layoutMode?: ToolWindowLayoutMode;
  files?: any[];
  commitMessage?: string;
  previousCommitMessage?: string;
  toolbarButtons?: CommitToolbarButton[];
  amendLabel?: string;
  messagePlaceholder?: string;
  commitLabel?: string;
  commitAndPushLabel?: string;
  onCommit?: (message: string, amend: boolean, checkedIds: Set<string>) => void;
  onCommitAndPush?: (message: string, amend: boolean, checkedIds: Set<string>) => void;
  focused?: boolean;
  onFocus?: () => void;
  onActionClick?: (action: string, payload?: unknown) => void;
  className?: string;
}

export const CommitWindow: FC<CommitWindowProps>;
export const DEFAULT_COMMIT_TOOLBAR_BUTTONS: CommitToolbarButton[];

// VCSLogWindow
// NOTE: VCSLogWindow has three internal toolbars (Branches sidebar, Commit Log, Commit Details).
// These toolbars contain specialized controls (search input, dropdowns, separators) that are
// not abstracted into a SidebarToolbarButton[] prop — they are hardcoded inside sub-components.
// To customise these, pass custom branch/commit/details data props to change content, or
// wrap VCSLogWindow and use toolbarExtra on the outer ToolWindow for header-level actions.
export interface VCSLogCommit {
  id: number;
  dotColor?: 'blue' | 'orange' | 'gray';
  isHead?: boolean;
  message?: string;
  messageLink?: string;
  messageSuffix?: string;
  refs?: Array<{ type: string; label: string }>;
  author: string;
  date: string;
}

export interface VCSLogCommitDetails {
  repoName?: string;
  repoPath?: string;
  fileCount?: number;
  title?: string;
  hash?: string;
  author?: string;
  authorEmail?: string;
  date?: string;
}

export interface VCSLogWindowProps {
  title?: string;
  tabs?: any[];
  branches?: any;
  commits?: VCSLogCommit[];
  detailsFiles?: any[];
  commitDetails?: VCSLogCommitDetails;
  selectedCommitId?: number;
  onCommitSelect?: (id: number) => void;
  width?: number | string;
  height?: number | string;
  layoutMode?: ToolWindowLayoutMode;
  focused?: boolean;
  onFocus?: () => void;
  onActionClick?: (action: string, payload?: unknown) => void;
  className?: string;
}

export const VCSLogWindow: FC<VCSLogWindowProps>;
export const DEFAULT_BRANCHES: any;
export const DEFAULT_COMMITS: VCSLogCommit[];
export const DEFAULT_DETAILS_FILES: any[];
export const DEFAULT_COMMIT_DETAILS: VCSLogCommitDetails;

// Tree Components
export const Tree: FC<{
  data?: TreeNodeData[];
  /** ID of the node to select on first render. Nodes without an explicit id
   *  use auto-generated ids (positional, e.g. "1-0") — provide an explicit id
   *  on nodes you want to target here. */
  defaultSelectedId?: string;
  onNodeSelect?: (id: string, selected: boolean) => void;
  onNodeToggle?: (id: string, expanded: boolean) => void;
  /**
   * Flat mode — hides chevrons and indentation.
   * Use for non-hierarchical lists: tasks, sessions, bookmarks, results, etc.
   * All hover/selection/sizing tokens are preserved.
   */
  flat?: boolean;
}>;

export interface TreeNodeProps {
  label?: ReactNode;
  icon?: string | ReactNode;
  secondaryText?: string;
  level?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
  onToggle?: (expanded: boolean) => void;
  onSelect?: (selected: boolean) => void;
  prefix?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Hides chevron/spacer column and indentation. See Tree `flat` prop. */
  flat?: boolean;
}

export const TreeNode: FC<TreeNodeProps>;

// DialogHeader
export interface DialogHeaderProps {
  title?: string;
  showMacOSButtons?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const DialogHeader: FC<DialogHeaderProps>;

// WelcomeDialog
export interface WelcomeProject {
  id: string;
  name: string;
  path: string;
  initials: string;
  gradient: [string, string];
}

export interface WelcomeNavItem {
  id: string;
  label: string;
  level: number;
  chevron?: 'none' | 'down' | 'right';
  iconUrl?: string;
}

export interface WelcomeDialogProps {
  ideTitle?: string;
  ideVersion?: string;
  ideIconUrl?: string;
  projects?: WelcomeProject[];
  navItems?: WelcomeNavItem[];
  activeNav?: string;
  onNavChange?: (id: string) => void;
  selectedProjectId?: string;
  onProjectSelect?: (id: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actionLabels?: { newProject?: string; open?: string; getFromVcs?: string };
  onNewProject?: () => void;
  onOpen?: () => void;
  onGetFromVCS?: () => void;
  onSettings?: () => void;
  onNotifications?: () => void;
  className?: string;
}

export const WelcomeDialog: FC<WelcomeDialogProps>;
export const DEFAULT_PROJECTS: WelcomeProject[];
export const NAV_ITEMS: WelcomeNavItem[];

// Icon Registry
export const iconRegistry: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>;
export const iconNames: string[];
export function getIcon(name: string): React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined;
