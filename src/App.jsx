import { useRef, useState } from 'react';
import { Button, Loader, MainWindow, ThemeProvider } from '@jetbrains/int-ui-kit';
import conflictDialogDisabledImage from '../img/Conflict dialog disabled.png';
import conflictDialogNothingResolvedImage from '../img/Conflict dialog nothing resolved.png';
import conflictDialogSomeResolvedImage from '../img/Conflict dialog some conflicts resolved.png';
import conflictDialogImage from '../img/Conflict dialog.png';
import checkmarkDarkIcon from '@jetbrains/int-ui-kit-icons/actions/checked_dark.svg';
import magicResolveToolbarIcon from '@jetbrains/int-ui-kit-icons/diff/magicResolveToolbar_dark.svg';
import ResolveConflictsProgressDialog from './ResolveConflictsProgressDialog.jsx';
import './App.css';

const NOTHING_RESOLVED_DELAY_MS = 600;
const TOOLTIP_DELAY_MS = 300;
const SCREEN_GROUPS = [
  {
    title: 'No loader, 600 ms delay',
    screens: [
      { id: 'quick-resolution-no-loader', label: 'Quick Resolution', resolutionMode: 'quick', buttonMode: 'no-loader' },
      { id: 'long-running-resolution-no-loader', label: 'Long-Running Resolution', resolutionMode: 'long-running', buttonMode: 'no-loader' },
    ],
  },
  {
    title: 'Loader on button',
    screens: [
      { id: 'quick-resolution-button-loader', label: 'Quick Resolution', resolutionMode: 'quick', buttonMode: 'button-loader' },
      { id: 'long-running-resolution-button-loader', label: 'Long-Running Resolution', resolutionMode: 'long-running', buttonMode: 'button-loader' },
    ],
  },
  {
    title: 'Status next to button',
    screens: [
      { id: 'quick-resolution-status-next-to-button', label: 'Quick Resolution', resolutionMode: 'quick', buttonMode: 'status-next-to-button' },
      { id: 'long-running-resolution-status-next-to-button', label: 'Long-Running Resolution', resolutionMode: 'long-running', buttonMode: 'status-next-to-button' },
    ],
  },
];
const SCREENS = SCREEN_GROUPS.flatMap((group) => group.screens);
const ACTIVE_SCREEN_STORAGE_KEY = 'vcs-prototypes-active-screen';

function getInitialActiveScreenId() {
  const storedScreenId = window.localStorage.getItem(ACTIVE_SCREEN_STORAGE_KEY);
  const isStoredScreenAvailable = SCREENS.some((screen) => screen.id === storedScreenId);

  return isStoredScreenAvailable ? storedScreenId : SCREENS[0].id;
}

function ProjectMainWindow({ children }) {
  return (
    <div className="main-window-layer">
      <MainWindow
        projectName="commons-math"
        projectIcon="CM"
        projectColor="grass"
        branchName="feature/resolve-conflicts"
        runConfig="IDEA Community"
        height="100%"
        defaultOpenToolWindows={['project']}
      />

      {children}
    </div>
  );
}

function ResolveConflictsDialog({ buttonMode, resolutionMode }) {
  const [isResolveButtonDisabled, setIsResolveButtonDisabled] = useState(false);
  const [conflictDialogState, setConflictDialogState] = useState('default');
  const [isProgressDialogVisible, setIsProgressDialogVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const tooltipTimerRef = useRef(null);
  const latestTooltipPositionRef = useRef(null);
  const isLongRunningResolution = resolutionMode === 'long-running';

  const conflictDialogImageByState = {
    default: conflictDialogImage,
    disabled: conflictDialogDisabledImage,
    nothingResolved: conflictDialogNothingResolvedImage,
    someResolved: conflictDialogSomeResolvedImage,
  };
  const isResolved = conflictDialogState === 'nothingResolved' || conflictDialogState === 'someResolved';
  const isButtonLoaderVisible = buttonMode === 'button-loader' && isResolveButtonDisabled && !isResolved;
  const isStatusVisible = buttonMode === 'status-next-to-button' && isResolveButtonDisabled && !isResolved;
  const resolveButtonIcon = isResolved ? checkmarkDarkIcon : magicResolveToolbarIcon;
  const resolveButtonText = isResolved
    ? 'All simple conflicts resolved'
    : 'Resolve All Simple Conflicts';
  const resolveButtonTooltip = isResolved ? 'There are no simple conflicts to resolve' : undefined;

  const getTooltipPosition = (event) => ({
    left: event.clientX + 12,
    top: event.clientY + 12,
  });

  const showTooltip = (event) => {
    if (!isResolved) {
      return;
    }

    latestTooltipPositionRef.current = getTooltipPosition(event);

    window.clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = window.setTimeout(() => {
      setTooltipPosition(latestTooltipPositionRef.current);
    }, TOOLTIP_DELAY_MS);
  };

  const updateTooltipPosition = (event) => {
    if (!isResolved) {
      return;
    }

    const nextTooltipPosition = getTooltipPosition(event);
    latestTooltipPositionRef.current = nextTooltipPosition;

    if (tooltipPosition) {
      setTooltipPosition(nextTooltipPosition);
    }
  };

  const hideTooltip = () => {
    window.clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = null;
    latestTooltipPositionRef.current = null;
    setTooltipPosition(null);
  };

  const handleResolveButtonClick = () => {
    setIsResolveButtonDisabled(true);
    setConflictDialogState('disabled');
    hideTooltip();

    window.setTimeout(() => {
      if (isLongRunningResolution) {
        setIsProgressDialogVisible(true);
        return;
      }

      setConflictDialogState('nothingResolved');
    }, NOTHING_RESOLVED_DELAY_MS);
  };

  const handleProgressComplete = () => {
    setIsProgressDialogVisible(false);
    setConflictDialogState('someResolved');
  };

  return (
    <>
      <div className="conflict-dialog-image-layer">
        <div className="conflict-dialog-image-frame">
          <img
            className="conflict-dialog-image"
            src={conflictDialogImageByState[conflictDialogState]}
            alt=""
          />
          <div
            className="conflict-dialog-button-wrapper"
            onMouseEnter={showTooltip}
            onMouseMove={updateTooltipPosition}
            onMouseLeave={hideTooltip}
          >
            <Button
              className="conflict-dialog-button"
              disabled={isResolveButtonDisabled}
              onClick={handleResolveButtonClick}
            >
              {isButtonLoaderVisible ? (
                <Loader size={16} className="conflict-dialog-button-loader" aria-hidden="true" />
              ) : (
                <img
                  className={`conflict-dialog-button-icon${isResolveButtonDisabled ? ' conflict-dialog-button-icon-disabled' : ''}`}
                  src={resolveButtonIcon}
                  alt=""
                />
              )}
              <span>{resolveButtonText}</span>
            </Button>

            {isStatusVisible && (
              <span className="conflict-dialog-button-status">Resolving simple conflicts...</span>
            )}

            {resolveButtonTooltip && tooltipPosition && (
              <div
                className="tooltip text-ui-default conflict-dialog-tooltip"
                style={{
                  left: tooltipPosition.left,
                  top: tooltipPosition.top,
                }}
              >
                <span className="tooltip-text">{resolveButtonTooltip}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isProgressDialogVisible && (
        <div className="progress-dialog-layer">
          <ResolveConflictsProgressDialog onComplete={handleProgressComplete} />
        </div>
      )}
    </>
  );
}

function ResolveConflictsScreen({ buttonMode, resolutionMode }) {
  return (
    <section className="dialog-demo-screen" aria-label="Resolve conflicts prototype">
      <ProjectMainWindow>
        <ResolveConflictsDialog
          buttonMode={buttonMode}
          resolutionMode={resolutionMode}
        />
      </ProjectMainWindow>
    </section>
  );
}

export default function App() {
  const [activeScreenId, setActiveScreenId] = useState(getInitialActiveScreenId);
  const activeScreen = SCREENS.find((screen) => screen.id === activeScreenId) ?? SCREENS[0];

  const handleScreenChange = (screenId) => {
    window.localStorage.setItem(ACTIVE_SCREEN_STORAGE_KEY, screenId);
    setActiveScreenId(screenId);
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <main className="prototype-shell">
        <div className="screen-switcher" role="tablist" aria-label="Prototype screens" aria-orientation="vertical">
          {SCREEN_GROUPS.map((group) => (
            <div className="screen-switcher-group" key={group.title}>
              <div className="screen-switcher-group-title">{group.title}</div>
              {group.screens.map((screen) => (
                <button
                  key={screen.id}
                  type="button"
                  className={`screen-switcher-tab${screen.id === activeScreenId ? ' screen-switcher-tab-active' : ''}`}
                  role="tab"
                  aria-selected={screen.id === activeScreenId}
                  onClick={() => handleScreenChange(screen.id)}
                >
                  {screen.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <ResolveConflictsScreen
          key={activeScreenId}
          buttonMode={activeScreen.buttonMode}
          resolutionMode={activeScreen.resolutionMode}
        />
      </main>
    </ThemeProvider>
  );
}
