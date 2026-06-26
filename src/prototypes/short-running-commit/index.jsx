import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MainWindow, CommitWindow } from '@jetbrains/int-ui-kit';
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

function CommitPanelContent({ context }) {
  const [files, setFiles] = useState([]);
  const panelRef = useRef(null);
  const [commitBtnsEl, setCommitBtnsEl] = useState(null);
  const [noFilesChecked, setNoFilesChecked] = useState(true);
  const [commited, setCommited] = useState(false);

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

  const handleAnimatedCommit = () => {
    const primaryBtn = panelRef.current?.querySelector('.button-primary');
    primaryBtn?.click();
    setNoFilesChecked(true);
    setTimeout(() => setCommited(true), 0);
  };

  useEffect(() => {
    if (!commited) return;
    const panel = panelRef.current;
    const handlePanelClick = () => setCommited(false);
    panel?.addEventListener('click', handlePanelClick);
    return () => panel?.removeEventListener('click', handlePanelClick);
  }, [commited]);

  return (
    <div ref={panelRef} className={`commit-panel-wrapper commit-window-custom${commited ? ' is-commited' : ''}${noFilesChecked ? '' : ' has-checked-files'}`}>
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
          : <AnimatedCommitButton onCommitComplete={handleAnimatedCommit} disabled={noFilesChecked} />,
        commitBtnsEl
      )}
    </div>
  );
}

export const SCREEN_GROUPS = [
  {
    title: 'Short-running Commit',
    screens: [
      { id: 'src-default', label: 'Default' },
      { id: 'src-button-animation', label: 'Commit button animation' },
    ],
  },
];

export default function CommitScreen({ screenId }) {
  const renderLeftPanel = (stripeId, context) => {
    if (stripeId === 'commit') {
      return <CommitPanelContent context={context} />;
    }
    return null;
  };

  if (screenId === 'src-button-animation') {
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
          defaultOpenToolWindows={['commit']}
          initialLeftPanelWidth={400}
          leftPanelContent={renderLeftPanel}
        />
      </div>
    </section>
  );
}
