import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MainWindow, CommitWindow, Notification } from '@jetbrains/int-ui-kit';
import './styles.css';

const COMMIT_FILES = [
  {
    id: 'changes',
    label: 'Changes',
    count: '7 files',
    isExpanded: true,
    children: [
      { id: 'adapter',    label: 'AdapterScript.java',    path: '~/IdeaProjects/FastMath/src/main/java/com/example', icon: 'fileTypes/java', status: 'modified' },
      { id: 'function',   label: 'FunctionUtils.java',    path: '~/IdeaProjects/FastMath/src/main/java/com/example', icon: 'fileTypes/java', status: 'modified' },
      { id: 'bivariate',  label: 'BivariateFunction.java', path: '~/IdeaProjects/FastMath/src/main/java/com/example', icon: 'fileTypes/java', status: 'modified' },
      { id: 'multivariate', label: 'MultivariateFunction.java', path: '~/IdeaProjects/FastMath/src/main/java/com/example', icon: 'fileTypes/java', status: 'modified' },
      { id: 'trivariate', label: 'TrivariateFunction.java', path: '~/IdeaProjects/FastMath/src/main/java/com/example', icon: 'fileTypes/java', status: 'modified' },
      { id: 'solver',     label: 'UnivariateSolver.java',  path: '~/IdeaProjects/FastMath/src/main/java/com/solver',  icon: 'fileTypes/java', status: 'modified' },
      { id: 'analysis',   label: 'AnalysisUtils.java',     path: '~/IdeaProjects/FastMath/src/main/java/com/example', icon: 'fileTypes/java', status: 'added'    },
    ],
  },
  {
    id: 'unversioned',
    label: 'Unversioned Files',
    count: '1 file',
    isExpanded: false,
    children: [
      { id: 'newhelper', label: 'NewHelper.java', path: '~/IdeaProjects/FastMath/src/main/java/com/example', icon: 'fileTypes/java', status: 'added' },
    ],
  },
];

const LOADING_DURATION_MS = 3000;

function CurrentCommitButton({ onCommit, disabled }) {
  const handleClick = () => {
    if (disabled) return;
    onCommit?.();
  };

  return (
    <button
      className={`commit-btn commit-btn${disabled ? '--secondary' : '--primary'}`}
      onClick={handleClick}
    >
      <span className="commit-btn__label">Commit</span>
    </button>
  );
}

function CurrentCommitPanelContent({ context, onLoadingChange }) {
  const [files, setFiles] = useState([]);
  const panelRef = useRef(null);
  const [commitBtnsEl, setCommitBtnsEl] = useState(null);
  const [noFilesChecked, setNoFilesChecked] = useState(true);

  useEffect(() => {
    context.setFocusedPanel('left');
    setFiles(COMMIT_FILES);
  }, []);

  useEffect(() => {
    const btns = panelRef.current?.querySelector('.commit-buttons');
    if (!btns) return;
    const container = document.createElement('div');
    container.style.display = 'contents';
    btns.prepend(container);
    setCommitBtnsEl(container);

    const panel = panelRef.current;
    const handleChange = () => {
      setTimeout(() => {
        const checked = [...panel.querySelectorAll('input[type=checkbox]:checked')]
          .filter(el => !el.closest('.commit-amend-toolbar'));
        setNoFilesChecked(checked.length === 0);
      }, 0);
    };
    panel.addEventListener('change', handleChange);

    return () => {
      panel.removeEventListener('change', handleChange);
      container.remove();
    };
  }, []);

  const handleCommit = (message, amend, checkedIds) => {
    setFiles((prev) =>
      prev
        .map((group) => ({
          ...group,
          children: group.children.filter((file) => !checkedIds.has(file.id)),
        }))
        .filter((group) => group.children.length > 0)
    );
  };

  const handleCommitClick = () => {
    const panel = panelRef.current;
    const checked = [...panel.querySelectorAll('input[type=checkbox]:checked')]
      .filter(el => !el.closest('.commit-amend-toolbar'));
    const textarea = panel.querySelector('.commit-message-textarea');
    const message = textarea?.value || '';
    const primaryBtn = panel.querySelector('.button-primary');
    primaryBtn?.click();
    setNoFilesChecked(true);
    setTimeout(() => onLoadingChange?.(checked.length, message), 0);
  };

  return (
    <div
      ref={panelRef}
      className={`current-commit-panel-wrapper commit-window-custom${noFilesChecked ? '' : ' has-checked-files'}`}
    >
      <CommitWindow
        files={files}
        commitMessage="Update conflict resolution dialog message for clearer state distinction"
        layoutMode={context.toolWindowLayoutMode}
        focused={context.focusedPanel === 'left'}
        onFocus={() => context.setFocusedPanel('left')}
        onCommit={handleCommit}
      />
      {commitBtnsEl && createPortal(
        <CurrentCommitButton
          onCommit={handleCommitClick}
          disabled={noFilesChecked}
        />,
        commitBtnsEl
      )}
    </div>
  );
}

export const SCREEN_GROUPS = [
  {
    title: 'New Short-running Commit',
    screens: [
      { id: 'nsrc-default', label: 'Default' },
    ],
  },
];

export default function CurrentCommitScreen({ screenId }) {
  const [notification, setNotification] = useState(null);

  const handleCommit = (filesCount, message) => {
    setNotification({ filesCount, message });
  };

  const renderLeftPanel = (stripeId, context) => {
    if (stripeId === 'commit') {
      return <CurrentCommitPanelContent context={context} onLoadingChange={handleCommit} />;
    }
    return null;
  };

  return (
    <section className="current-commit-screen" aria-label="Current Commit prototype">
      <div className="main-window-layer">
        <MainWindow
          projectName="commons-math"
          projectIcon="CM"
          projectColor="grass"
          branchName="feature/resolve-conflicts"
          runConfig="IDEA Community"
          height="100%"
          defaultOpenToolWindows={['commit']}
          initialLeftPanelWidth={400}
          leftPanelContent={renderLeftPanel}
        />
      </div>
      {notification && (
        <div className="current-commit-notification-overlay">
          <Notification
            type="info"
            title={`${notification.filesCount} file${notification.filesCount !== 1 ? 's' : ''} committed`}
            actions={[{ label: 'Edit commit message...', onClick: () => setNotification(null) }]}
            onClose={() => setNotification(null)}
          >
            {notification.message}
          </Notification>
        </div>
      )}
    </section>
  );
}
