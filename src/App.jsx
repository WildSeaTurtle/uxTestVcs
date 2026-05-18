import { useState } from 'react';
import { Button, MainWindow, ThemeProvider } from '@jetbrains/int-ui-kit';
import conflictDialogDisabledImage from '../img/Conflict dialog disabled.png';
import conflictDialogNothingResolvedImage from '../img/Conflict dialog nothing resolved.png';
import conflictDialogImage from '../img/Conflict dialog.png';
import magicResolveToolbarIcon from '../../int-ui-kit-for-web/src/icons/diff/magicResolveToolbar_dark.svg';
import './App.css';

const NOTHING_RESOLVED_DELAY_MS = 600;

export default function App() {
  const [isResolveButtonDisabled, setIsResolveButtonDisabled] = useState(false);
  const [conflictDialogState, setConflictDialogState] = useState('default');

  const conflictDialogImageByState = {
    default: conflictDialogImage,
    disabled: conflictDialogDisabledImage,
    nothingResolved: conflictDialogNothingResolvedImage,
  };

  const handleResolveButtonClick = () => {
    setIsResolveButtonDisabled(true);
    setConflictDialogState('disabled');

    window.setTimeout(() => {
      setConflictDialogState('nothingResolved');
    }, NOTHING_RESOLVED_DELAY_MS);
  };

  return (
    <ThemeProvider defaultTheme="light">
      <main className="dialog-demo-screen">
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
                  src={magicResolveToolbarIcon}
                  alt=""
                />
                <span>Resolve All Simple Conflicts</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}
