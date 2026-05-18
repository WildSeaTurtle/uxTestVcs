import { useState } from 'react';
import { Button, MainWindow, ThemeProvider } from '@jetbrains/int-ui-kit';
import conflictDialogDisabledImage from '../img/Conflict dialog disabled.png';
import conflictDialogNothingResolvedImage from '../img/Conflict dialog nothing resolved.png';
import conflictDialogSomeResolvedImage from '../img/Conflict dialog some conflicts resolved.png';
import conflictDialogImage from '../img/Conflict dialog.png';
import checkmarkDarkIcon from '@jetbrains/int-ui-kit-icons/actions/checked_dark.svg';
import magicResolveToolbarIcon from '@jetbrains/int-ui-kit-icons/diff/magicResolveToolbar_dark.svg';
import ResolveConflictsProgressDialog from './ResolveConflictsProgressDialog.jsx';
import './App.css';

const NOTHING_RESOLVED_DELAY_MS = 600;
const SCREENS = [
  { id: 'quick-resolution', label: 'Quick Resolution' },
  { id: 'long-running-resolution', label: 'Long-Running Resolution' },
];
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

function ResolveConflictsDialog({ resolutionMode }) {
  const [isResolveButtonDisabled, setIsResolveButtonDisabled] = useState(false);
  const [conflictDialogState, setConflictDialogState] = useState('default');
  const [isProgressDialogVisible, setIsProgressDialogVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const isLongRunningResolution = resolutionMode === 'long-running';

  const conflictDialogImageByState = {
    default: conflictDialogImage,
    disabled: conflictDialogDisabledImage,
    nothingResolved: conflictDialogNothingResolvedImage,
    someResolved: conflictDialogSomeResolvedImage,
  };
  const isResolved = conflictDialogState === 'nothingResolved' || conflictDialogState === 'someResolved';
  const resolveButtonIcon = isResolved ? checkmarkDarkIcon : magicResolveToolbarIcon;
  const resolveButtonText = conflictDialogState === 'someResolved'
    ? 'Some simple conflicts resolved'
    : isResolved ? 'All simple conflicts resolved' : 'Resolve All Simple Conflicts';
  const resolveButtonTooltip = isResolved ? 'There are no simple conflicts to resolve' : undefined;

  const updateTooltipPosition = (event) => {
    if (!isResolved) {
      return;
    }

    setTooltipPosition({
      left: event.clientX + 12,
      top: event.clientY + 12,
    });
  };

  const hideTooltip = () => {
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
            onMouseEnter={updateTooltipPosition}
            onMouseMove={updateTooltipPosition}
            onMouseLeave={hideTooltip}
          >
            <Button
              className="conflict-dialog-button"
              disabled={isResolveButtonDisabled}
              onClick={handleResolveButtonClick}
            >
              <img
                className={`conflict-dialog-button-icon${isResolveButtonDisabled ? ' conflict-dialog-button-icon-disabled' : ''}`}
                src={resolveButtonIcon}
                alt=""
              />
              <span>{resolveButtonText}</span>
            </Button>

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

function ResolveConflictsScreen({ resolutionMode }) {
  return (
    <section className="dialog-demo-screen" aria-label="Resolve conflicts prototype">
      <ProjectMainWindow>
        <ResolveConflictsDialog resolutionMode={resolutionMode} />
      </ProjectMainWindow>
    </section>
  );
}

export default function App() {
  const [activeScreenId, setActiveScreenId] = useState(getInitialActiveScreenId);
  const activeResolutionMode = activeScreenId === 'long-running-resolution' ? 'long-running' : 'quick';

  const handleScreenChange = (screenId) => {
    window.localStorage.setItem(ACTIVE_SCREEN_STORAGE_KEY, screenId);
    setActiveScreenId(screenId);
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <main className="prototype-shell">
        <div className="screen-switcher" role="tablist" aria-label="Prototype screens" aria-orientation="vertical">
          {SCREENS.map((screen) => (
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

        <ResolveConflictsScreen
          key={activeScreenId}
          resolutionMode={activeResolutionMode}
        />
      </main>
    </ThemeProvider>
  );
}
