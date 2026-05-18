import { useState } from 'react';
import { Button, MainWindow, ThemeProvider } from '@jetbrains/int-ui-kit';
import conflictDialogDisabledImage from '../img/Conflict dialog disabled.png';
import conflictDialogNothingResolvedImage from '../img/Conflict dialog nothing resolved.png';
import conflictDialogImage from '../img/Conflict dialog.png';
import checkmarkDarkIcon from '@jetbrains/int-ui-kit-icons/actions/checked_dark.svg';
import magicResolveToolbarIcon from '@jetbrains/int-ui-kit-icons/diff/magicResolveToolbar_dark.svg';
import ResolveConflictsProgressDialog from './ResolveConflictsProgressDialog.jsx';
import './App.css';

const NOTHING_RESOLVED_DELAY_MS = 600;
const SCREENS = [
  { id: 'quick-resolution', label: 'Quick Resolution' },
  { id: 'long-running-resolution', label: 'Long-Running Resolution' },
  { id: 'progress-bar', label: 'Progress Bar' },
];

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

function ResolveConflictsDialog() {
  const [isResolveButtonDisabled, setIsResolveButtonDisabled] = useState(false);
  const [conflictDialogState, setConflictDialogState] = useState('default');

  const conflictDialogImageByState = {
    default: conflictDialogImage,
    disabled: conflictDialogDisabledImage,
    nothingResolved: conflictDialogNothingResolvedImage,
  };
  const isNothingResolved = conflictDialogState === 'nothingResolved';
  const resolveButtonIcon = isNothingResolved ? checkmarkDarkIcon : magicResolveToolbarIcon;
  const resolveButtonText = isNothingResolved ? 'All simple conflicts resolved' : 'Resolve All Simple Conflicts';

  const handleResolveButtonClick = () => {
    setIsResolveButtonDisabled(true);
    setConflictDialogState('disabled');

    window.setTimeout(() => {
      setConflictDialogState('nothingResolved');
    }, NOTHING_RESOLVED_DELAY_MS);
  };

  return (
    <div className="conflict-dialog-image-layer">
      <div className="conflict-dialog-image-frame">
        <img
          className="conflict-dialog-image"
          src={conflictDialogImageByState[conflictDialogState]}
          alt=""
        />
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
      </div>
    </div>
  );
}

function ResolveConflictsScreen() {
  return (
    <section className="dialog-demo-screen" aria-label="Resolve conflicts prototype">
      <ProjectMainWindow>
        <ResolveConflictsDialog />
      </ProjectMainWindow>
    </section>
  );
}

function ProgressBarScreen() {
  return (
    <section className="dialog-demo-screen" aria-label="Progress bar prototype">
      <ProjectMainWindow>
        <div className="progress-dialog-layer">
          <ResolveConflictsProgressDialog />
        </div>
      </ProjectMainWindow>
    </section>
  );
}

export default function App() {
  const [activeScreenId, setActiveScreenId] = useState(SCREENS[0].id);

  return (
    <ThemeProvider defaultTheme="dark">
      <main className="prototype-shell">
        <div className="screen-switcher" role="tablist" aria-label="Prototype screens">
          {SCREENS.map((screen) => (
            <button
              key={screen.id}
              type="button"
              className={`screen-switcher-tab${screen.id === activeScreenId ? ' screen-switcher-tab-active' : ''}`}
              role="tab"
              aria-selected={screen.id === activeScreenId}
              onClick={() => setActiveScreenId(screen.id)}
            >
              {screen.label}
            </button>
          ))}
        </div>

        {activeScreenId === 'progress-bar' ? (
          <ProgressBarScreen key={activeScreenId} />
        ) : (
          <ResolveConflictsScreen key={activeScreenId} />
        )}
      </main>
    </ThemeProvider>
  );
}
