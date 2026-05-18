import { useEffect, useState } from 'react';
import { Dialog, ProgressBar } from '@jetbrains/int-ui-kit';

const PROGRESS_STEP_MS = 700;
const PROGRESS_INCREMENT = 7;

export default function ResolveConflictsProgressDialog() {
  const [progress, setProgress] = useState(28);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((currentProgress) => {
        const nextProgress = currentProgress + PROGRESS_INCREMENT;

        return nextProgress > 96 ? 28 : nextProgress;
      });
    }, PROGRESS_STEP_MS);

    return () => window.clearInterval(progressTimer);
  }, []);

  return (
    <Dialog
      title="Resolving Conflicts"
      width={420}
      showHelp={false}
      buttons={[
        { children: 'Background', type: 'secondary' },
        { children: 'Cancel', type: 'secondary' },
      ]}
      className="progress-dialog"
    >
      <div className="progress-dialog-content">
        <div className="progress-dialog-header">
          <div className="progress-dialog-title">Applying selected conflict resolutions</div>
          <div className="progress-dialog-percent">{progress}%</div>
        </div>

        <ProgressBar
          value={progress}
          labelPosition="top"
          hint="Merging files and updating VCS metadata"
          className="project-progress"
        />

        <div className="progress-dialog-details">
          <span>Processing unresolved files</span>
          <span>2 of 6 conflicts</span>
        </div>
      </div>
    </Dialog>
  );
}
