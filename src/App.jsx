import { useState, useEffect } from 'react';
import { ThemeProvider } from '@jetbrains/int-ui-kit';

import CommitScreen, { SCREEN_GROUPS as COMMIT_GROUPS } from './prototypes/commit/index.jsx';
import ShortRunningCommitScreen, { SCREEN_GROUPS as SHORT_RUNNING_COMMIT_GROUPS } from './prototypes/short-running-commit/index.jsx';
import './App.css';

const PROTOTYPES = [
  {
    id: 'commit',
    label: 'Commit',
    screenGroups: COMMIT_GROUPS,
    component: CommitScreen,
  },
  {
    id: 'short-running-commit',
    label: 'New Short-running Commit',
    screenGroups: SHORT_RUNNING_COMMIT_GROUPS,
    component: ShortRunningCommitScreen,
  },
];

function getPrototypeIdFromHash() {
  const hash = window.location.hash.slice(1);
  return PROTOTYPES.some((p) => p.id === hash) ? hash : PROTOTYPES[0].id;
}

function getInitialScreenId(prototypeId) {
  const prototype = PROTOTYPES.find((p) => p.id === prototypeId);
  const allScreens = prototype.screenGroups.flatMap((g) => g.screens);
  return allScreens[0]?.id;
}

export default function App() {
  const [activePrototypeId, setActivePrototypeId] = useState(getPrototypeIdFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setActivePrototypeId(getPrototypeIdFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const activePrototype = PROTOTYPES.find((p) => p.id === activePrototypeId);
  const activeScreenId = getInitialScreenId(activePrototypeId);
  const allScreens = activePrototype.screenGroups.flatMap((g) => g.screens);
  const activeScreen = allScreens.find((s) => s.id === activeScreenId) ?? allScreens[0];

  const PrototypeComponent = activePrototype.component;

  return (
    <ThemeProvider defaultTheme="dark">
      <main className="prototype-shell">
        <div className="prototype-content">
          <PrototypeComponent
            key={`${activePrototypeId}::${activeScreenId}`}
            screenId={activeScreenId}
            buttonMode={activeScreen?.buttonMode}
            resolutionMode={activeScreen?.resolutionMode}
            delay={activeScreen?.delay}
          />
        </div>
      </main>
    </ThemeProvider>
  );
}
