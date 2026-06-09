import { useState, useEffect } from 'react';
import { MainWindow, CommitWindow } from '@jetbrains/int-ui-kit';
import CommitButtonDemo from './CommitButtonDemo.jsx';
import AnimatedCommitButton from './AnimatedCommitButton.jsx';
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

function CommitPanelContent({ context }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    context.setFocusedPanel('left');
    setFiles(COMMIT_FILES);
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
    const allIds = new Set(files.flatMap((g) => g.children.map((f) => f.id)));
    handleCommit('', false, allIds);
  };

  return (
    <div className="commit-panel-wrapper commit-window-custom">
      <CommitWindow
        files={files}
        commitMessage="Update conflict resolution dialog message for clearer state distinction"
        layoutMode={context.toolWindowLayoutMode}
        focused={context.focusedPanel === 'left'}
        onFocus={() => context.setFocusedPanel('left')}
        onCommit={handleCommit}
      />
      <div className="commit-animated-btn-wrapper">
        <AnimatedCommitButton onCommitComplete={handleAnimatedCommit} />
      </div>
    </div>
  );
}

function renderLeftPanel(stripeId, context) {
  if (stripeId === 'commit') {
    return <CommitPanelContent context={context} />;
  }
  return null;
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
          defaultOpenToolWindows={['commit']}
          initialLeftPanelWidth={400}
          leftPanelContent={renderLeftPanel}
        />
      </div>
    </section>
  );
}
