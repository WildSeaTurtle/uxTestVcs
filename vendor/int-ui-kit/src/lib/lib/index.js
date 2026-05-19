/**
 * JetBrains Int UI - React Component Library
 * A design system for building JetBrains-style interfaces
 */

// Global styles (theme tokens, typography)
import './styles';

// Theme Provider
export { ThemeProvider, useTheme } from '../ThemeContext';

// Core Components
export { default as Badge, BadgeNew, BadgeBeta, BadgeFree, BadgeTrial } from '../ui/components/badge/Badge';
export { default as Banner } from '../ui/components/banner/Banner';
export { default as Button } from '../ui/components/button/Button';
export { default as Checkbox } from '../ui/components/checkbox/Checkbox';
export { default as Combobox } from '../ui/components/combobox/Combobox';
export { default as Dropdown } from '../ui/components/dropdown/Dropdown';
export { default as FormLayout } from '../ui/components/formlayout/FormLayout';
export { default as FormRow } from '../ui/components/formlayout/FormRow';
export { default as EmptyState } from '../ui/components/emptystate/EmptyState';
export { default as Icon } from '../ui/components/icon/Icon';
export { default as IconButton } from '../ui/components/iconbutton/IconButton';
/** Same component as IconButton — export alias for tool-window / header toolbars (matches internal imports). */
export { default as ToolbarIconButton } from '../ui/components/iconbutton/IconButton';
export { default as Input } from '../ui/components/input/Input';
export { default as Link } from '../ui/components/link/Link';
export { default as Popup } from '../ui/components/popup/Popup';
export { default as PopupCell } from '../ui/components/popup/PopupCell';
export { default as PositionedPopup } from '../ui/components/popup/PositionedPopup';
export { positionPopup } from '../ui/utils/positionPopup';
export { default as PopupProjects } from '../ui/components/popup/PopupProjects';
export { default as PopupBranches } from '../ui/components/popup/PopupBranches';
export { default as PopupLineWithActions } from '../ui/components/popup/PopupLineWithActions';
export { default as PopupRunWidget } from '../ui/components/popup/PopupRunWidget';
export { default as PopupFindInFiles } from '../ui/components/popup/PopupFindInFiles';
export { default as SearchEverywherePopup } from '../ui/components/popup/SearchEverywherePopup';
export { default as SettingsGearMenu } from '../ui/components/popup/SettingsGearMenu';
export { default as Loader } from '../ui/components/loader/Loader';
export { default as ProgressBar } from '../ui/components/progressbar/ProgressBar';
export { default as Radio, RadioGroup } from '../ui/components/radio/Radio';
export { default as Search } from '../ui/components/search/Search';
export { default as SegmentedControl } from '../ui/components/segmentedcontrol/SegmentedControl';
export { default as Table } from '../ui/components/table/Table';
export { default as Toggle } from '../ui/components/toggle/Toggle';
export { default as Alert } from '../ui/components/alert/Alert';
export { default as OpenProjectAlert } from '../ui/components/alert/OpenProjectAlert';

// Dialog Components
export { default as Dialog } from '../ui/components/dialog/Dialog';
export { default as DialogHeader } from '../ui/components/dialog/DialogHeader';
export { default as DialogFooter } from '../ui/components/dialog/DialogFooter';
export { default as DialogGroupHeader } from '../ui/components/dialog/DialogGroupHeader';
export { default as WelcomeDialog, DEFAULT_PROJECTS, NAV_ITEMS } from '../ui/components/dialog/WelcomeDialog';
export { default as SettingsDialog, DEFAULT_SETTINGS_TREE_ITEMS, DEFAULT_SETTINGS_PAGES } from '../ui/components/dialog/SettingsDialog';
export { default as SettingsAppearanceContent } from '../ui/components/dialog/SettingsAppearanceContent';
export { default as SettingsPluginsContent } from '../ui/components/dialog/SettingsPluginsContent';

// Tooltip
export { default as Tooltip } from '../ui/components/tooltip/Tooltip';
export { default as TooltipEditor } from '../ui/components/tooltip/TooltipEditor';
export { default as TooltipHelp } from '../ui/components/tooltip/TooltipHelp';
export { default as ValidationTooltip } from '../ui/components/tooltip/ValidationTooltip';
export { default as GotItTooltip } from '../ui/components/tooltip/GotItTooltip';

// Notification
export { default as Notification, NotificationStack } from '../ui/components/notification/Notification';

// Editor Component
export { default as Editor } from '../ui/components/editor/Editor';

// Layout Components
export { default as MainWindow, DEFAULT_EDITOR_TABS, DEFAULT_EDITOR_TAB_CONTENTS, DEFAULT_JAVA_CODE, DEFAULT_EDITOR_EMPTY_SHORTCUTS_MAC, DEFAULT_PROJECT_TREE_DATA, DEFAULT_LEFT_STRIPE_ITEMS, DEFAULT_RIGHT_STRIPE_ITEMS, DEFAULT_BOTTOM_STRIPE_ITEMS, DEFAULT_OPEN_TOOL_WINDOWS, defaultLeftPanelContent, defaultRightPanelContent, defaultBottomPanelContent } from '../ui/components/mainwindow/MainWindow';
export { default as EditorAreaEmptyState } from '../ui/components/mainwindow/EditorAreaEmptyState';
export { default as MacOsProjectsTabBar } from '../ui/components/macosprojectstabbar/MacOsProjectsTabBar';
export { default as IDEWindow } from '../ui/components/idewindow/IDEWindow';

// Navigation Components
export { default as Tab } from '../ui/components/tabs/Tab';
export { default as TabBar } from '../ui/components/tabs/TabBar';
export { default as StripeIconButton } from '../ui/components/stripe/Stripe';
export { default as StripeContainer } from '../ui/components/stripe/StripeContainer';

// Toolbar Components (regular — 26px, for tool-window toolbars)
export { default as ToolbarButton } from '../ui/components/toolbar/ToolbarButton';
export { default as ToolbarSeparator } from '../ui/components/toolbar/ToolbarSeparator';
export { default as ToolbarDropdown } from '../ui/components/toolbardropdown/ToolbarDropdown';

// Main Toolbar Components (40px, for the main application toolbar)
export { default as MainToolbar, DEFAULT_RIGHT_ACTIONS } from '../ui/components/maintoolbar/MainToolbar';
export { default as MainToolbarIconButton } from '../ui/components/maintoolbar/MainToolbarIconButton';
export { default as MainToolbarDropdown } from '../ui/components/maintoolbar/MainToolbarDropdown';
export { default as MainToolbarVerticalSeparator } from '../ui/components/maintoolbar/MainToolbarVerticalSeparator';
export { default as ProjectWidget } from '../ui/components/projectwidget/ProjectWidget';
export { default as RunWidget } from '../ui/components/runwidget/RunWidget';

// Status Bar Components
export { default as StatusBar, DEFAULT_BREADCRUMBS, DEFAULT_WIDGETS } from '../ui/components/statusbar/StatusBar';
export { default as StatusBarBreadcrumb } from '../ui/components/statusbar/StatusBarBreadcrumb';
export { default as StatusBarProgress } from '../ui/components/statusbar/StatusBarProgress';
export { default as StatusBarWidget } from '../ui/components/statusbar/StatusBarWidget';

// Tool Window Components
export { default as ToolWindow } from '../ui/components/toolwindow/ToolWindow';
export { default as ToolWindowHeader } from '../ui/components/toolwindow/ToolWindowHeader';
export { default as TerminalWindow } from '../ui/components/toolwindow/TerminalWindow';
export { default as ProjectWindow } from '../ui/components/toolwindow/ProjectWindow';
export { default as AIAssistantWindow } from '../ui/components/toolwindow/AIAssistantWindow';
export { default as ProblemsWindow, DEFAULT_PROBLEMS_TOOLBAR_BUTTONS } from '../ui/components/toolwindow/ProblemsWindow';
export { default as CommitWindow, DEFAULT_COMMIT_TOOLBAR_BUTTONS } from '../ui/components/toolwindow/CommitWindow';
export { default as VCSLogWindow, VCSLogContent, DEFAULT_BRANCHES, DEFAULT_COMMITS, DEFAULT_DETAILS_FILES, DEFAULT_COMMIT_DETAILS } from '../ui/components/toolwindow/VCSLogWindow';
export {
    default as ServicesWindow,
    DEFAULT_SERVICES_TREE_DATA,
    DEFAULT_SERVICES_LEFT_TOOLBAR,
    DEFAULT_SERVICES_RIGHT_TOOLBAR,
} from '../ui/components/toolwindow/ServicesWindow';

// Tree Components
export { default as Tree } from '../ui/components/tree/Tree';
export { default as TreeNode } from '../ui/components/tree/TreeNode';

// Icon Registry (static — no require.context)
export { default as iconRegistry, iconNames, getIcon } from './iconRegistry';

// Hooks
export { default as useDraggable } from '../hooks/useDraggable';
