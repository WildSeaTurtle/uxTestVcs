import { useEffect, useState } from 'react';
import { Button, Dialog, ProgressBar } from '@jetbrains/int-ui-kit';

const TOTAL_FILES = 15;
const PROGRESS_DURATION_MS = 9000;
const PROGRESS_PAUSE_MS = 700;
const COMPLETE_DISMISS_DELAY_MS = 300;
const PAUSE_FILES = [3, 8];
const PAUSE_PROGRESS_POINTS = PAUSE_FILES.map((fileNumber) => ((fileNumber - 1) / TOTAL_FILES) * 100);

export default function ResolveConflictsProgressDialog({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const currentFile = Math.min(TOTAL_FILES, Math.floor((progress / 100) * TOTAL_FILES + 0.0001) + 1);

  useEffect(() => {
    let animationFrameId;
    let startedAt;
    let pausedAt;
    let completeTimerId;
    let accumulatedPauseMs = 0;
    const completedPauses = new Set();

    const animateProgress = (timestamp) => {
      if (startedAt === undefined) {
        startedAt = timestamp;
      }

      if (pausedAt !== undefined) {
        const pauseElapsed = timestamp - pausedAt;

        if (pauseElapsed < PROGRESS_PAUSE_MS) {
          animationFrameId = window.requestAnimationFrame(animateProgress);
          return;
        }

        accumulatedPauseMs += pauseElapsed;
        pausedAt = undefined;
      }

      const elapsed = timestamp - startedAt - accumulatedPauseMs;
      const nextProgress = Math.min(100, (elapsed / PROGRESS_DURATION_MS) * 100);
      const nextPausePoint = PAUSE_PROGRESS_POINTS.find((pausePoint) => (
        nextProgress >= pausePoint && !completedPauses.has(pausePoint)
      ));

      if (nextPausePoint !== undefined && nextProgress < 100) {
        completedPauses.add(nextPausePoint);
        pausedAt = timestamp;
        setProgress(nextPausePoint);
        animationFrameId = window.requestAnimationFrame(animateProgress);
        return;
      }

      setProgress(nextProgress);

      if (nextProgress < 100) {
        animationFrameId = window.requestAnimationFrame(animateProgress);
      } else {
        completeTimerId = window.setTimeout(() => {
          onComplete?.();
        }, COMPLETE_DISMISS_DELAY_MS);
      }
    };

    animationFrameId = window.requestAnimationFrame(animateProgress);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(completeTimerId);
    };
  }, [onComplete]);

  return (
    <Dialog
      title=""
      width={420}
      showMacOSButtons={false}
      showHelp={false}
      buttons={[]}
      className="progress-dialog"
    >
      <div className="progress-dialog-content">
        <div className="progress-dialog-title">Resolving simple conflicts...</div>

        <div className="progress-dialog-row">
          <ProgressBar
            value={progress}
            className="project-progress"
          />

          <Button type="secondary">Cancel</Button>
        </div>

        <div className="progress-dialog-details">File {currentFile} of {TOTAL_FILES}</div>
      </div>
    </Dialog>
  );
}
