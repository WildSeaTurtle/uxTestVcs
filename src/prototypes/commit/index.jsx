import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MainWindow, CommitWindow, AIAssistantWindow } from '@jetbrains/int-ui-kit';
import CommitButtonDemo from './CommitButtonDemo.jsx';
import AnimatedCommitButton, { CommitedButton } from './AnimatedCommitButton.jsx';
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
      { id: 'solver',     label: 'UnivariateSolver.java',  path: '~/IdeaProjects/FastMath/src/main/java/com/example',  icon: 'fileTypes/java', status: 'modified' },
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

const FIXED_BREADCRUMBS = [
  { label: 'commons-math' },
  { label: 'src' },
  { label: 'main' },
  { label: 'java' },
  { label: 'AdapterScript', iconName: 'fileTypes/java' },
];

function CommitPanelContent({ context, onLoadingChange }) {
  const [files, setFiles] = useState([]);
  const panelRef = useRef(null);
  const [commitBtnsEl, setCommitBtnsEl] = useState(null);
  const [noFilesChecked, setNoFilesChecked] = useState(true);
  const [commited, setCommited] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleCommitStart = () => {
    setLoading(true);
    onLoadingChange?.(true);
  };

  const handleAnimatedCommit = () => {
    const primaryBtn = panelRef.current?.querySelector('.button-primary');
    primaryBtn?.click();
    setNoFilesChecked(true);
    setLoading(false);
    onLoadingChange?.(false);
    setCommited(true);
  };

  useEffect(() => {
    if (!commited) return;
    const panel = panelRef.current;
    const handlePanelClick = () => setCommited(false);
    panel?.addEventListener('click', handlePanelClick);
    return () => panel?.removeEventListener('click', handlePanelClick);
  }, [commited]);

  return (
    <div ref={panelRef} className={`commit-panel-wrapper commit-window-custom${loading ? ' is-loading' : ''}${commited ? ' is-commited' : ''}${noFilesChecked ? '' : ' has-checked-files'}`}>
      <CommitWindow
        files={files}
        commitMessage="Update conflict resolution dialog message for clearer state distinction"
        layoutMode={context.toolWindowLayoutMode}
        focused={context.focusedPanel === 'left'}
        onFocus={() => context.setFocusedPanel('left')}
        onCommit={handleCommit}
      />
      {commitBtnsEl && createPortal(
        commited
          ? <CommitedButton onClick={() => setCommited(false)} />
          : <AnimatedCommitButton onCommitStart={handleCommitStart} onCommitComplete={handleAnimatedCommit} disabled={noFilesChecked} />,
        commitBtnsEl
      )}
    </div>
  );
}

export const SCREEN_GROUPS = [
  {
    title: 'Commit tool window',
    screens: [
      { id: 'commit-default', label: 'Default' },
      { id: 'commit-button-animation', label: 'Commit button animation' },
    ],
  },
];

export default function CommitScreen({ screenId }) {
  const [loading, setLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const progressTimerRef = useRef(null);

  const handleLoadingChange = (isLoading) => {
    setLoading(isLoading);
    if (isLoading) {
      setProgressValue(0);
      const start = Date.now();
      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const value = Math.min(Math.round((elapsed / LOADING_DURATION_MS) * 100), 100);
        setProgressValue(value);
        if (value >= 100) clearInterval(progressTimerRef.current);
      }, 50);
    } else {
      clearInterval(progressTimerRef.current);
      setProgressValue(0);
    }
  };

  useEffect(() => () => clearInterval(progressTimerRef.current), []);

  const renderLeftPanel = (stripeId, context) => {
    if (stripeId === 'commit') {
      return <CommitPanelContent context={context} onLoadingChange={handleLoadingChange} />;
    }
    return null;
  };

  if (screenId === 'commit-button-animation') {
    return (
      <section className="commit-screen" aria-label="Commit button animation">
        <CommitButtonDemo />
      </section>
    );
  }

  return (
    <section className="commit-screen" aria-label="Commit prototype">
      <div className="main-window-layer">
        <MainWindow
          projectName="commons-math"
          projectIcon="CM"
          projectColor="grass"
          branchName="feature/resolve-conflicts"
          runConfig="IDEA Community"
          height="100%"
          defaultOpenToolWindows={['commit', 'ai']}
          initialLeftPanelWidth={400}
          leftPanelContent={renderLeftPanel}
          rightPanelContent={(stripeId, ctx) => stripeId === 'ai' ? <AIAssistantWindow layoutMode={ctx.toolWindowLayoutMode} /> : null}
          statusBarProps={loading ? { progress: true, progressLabel: 'Commiting', progressValue, breadcrumbs: FIXED_BREADCRUMBS } : { breadcrumbs: FIXED_BREADCRUMBS }}
        />
      </div>
    </section>
  );
}
