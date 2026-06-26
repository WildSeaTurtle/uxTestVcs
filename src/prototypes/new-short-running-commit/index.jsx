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

function CheckmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="commit-btn__icon">
      <path d="M4 8.5L7 11.5L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CurrentCommitButton({ onCommit, disabled }) {
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    if (!disabled) setCommitted(false);
  }, [disabled]);

  const handleClick = () => {
    if (disabled) return;
    setCommitted(true);
    onCommit?.();
  };

  const isCommitted = committed && disabled;

  return (
    <button
      className={`commit-btn ${isCommitted ? 'commit-btn--committed' : disabled ? 'commit-btn--secondary' : 'commit-btn--primary'}`}
      onClick={handleClick}
    >
      {isCommitted && <CheckmarkIcon />}
      <span className="commit-btn__label">{isCommitted ? 'Committed' : 'Commit'}</span>
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
  const [notifications, setNotifications] = useState([]);
  const [notificationPos, setNotificationPos] = useState(null);
  const layerRef = useRef(null);
  const notifIdRef = useRef(0);

  const hasNotifications = notifications.length > 0;
  useEffect(() => {
    if (!hasNotifications) { setNotificationPos(null); return; }
    const updatePos = () => {
      const island = layerRef.current?.querySelector('.main-window-island');
      if (!island) return;
      const rect = island.getBoundingClientRect();
      setNotificationPos({ bottom: window.innerHeight - rect.bottom + 25, right: window.innerWidth - rect.right + 46 });
    };
    updatePos();
    window.addEventListener('resize', updatePos);
    return () => window.removeEventListener('resize', updatePos);
  }, [hasNotifications]);

  const handleCommit = (filesCount, message) => {
    setNotifications(prev => [{ id: ++notifIdRef.current, filesCount, message }, ...prev]);
  };

  const renderLeftPanel = (stripeId, context) => {
    if (stripeId === 'commit') {
      return <CurrentCommitPanelContent context={context} onLoadingChange={handleCommit} />;
    }
    return null;
  };

  return (
    <section className="current-commit-screen" aria-label="Current Commit prototype">
      <div className="main-window-layer" ref={layerRef}>
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
      {notificationPos && notifications.length > 0 && (
        <div className="current-commit-notification-overlay" style={{ bottom: notificationPos.bottom, right: notificationPos.right }}>
          {notifications.map(n => (
            <Notification
              key={n.id}
              type="info"
              title={`${n.filesCount} file${n.filesCount !== 1 ? 's' : ''} committed`}
              actions={[{ label: 'Edit commit message...', onClick: () => setNotifications(prev => prev.filter(x => x.id !== n.id)) }]}
              onClose={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
            >
              {n.message}
            </Notification>
          ))}
        </div>
      )}
    </section>
  );
}
