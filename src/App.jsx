import { useState, useEffect } from 'react';
import { ThemeProvider } from '@jetbrains/int-ui-kit';

import CommitScreen, { SCREEN_GROUPS as COMMIT_GROUPS } from './prototypes/commit/index.jsx';
import ShortRunningCommitScreen, { SCREEN_GROUPS as SHORT_RUNNING_COMMIT_GROUPS } from './prototypes/short-running-commit/index.jsx';
import CurrentCommitScreen, { SCREEN_GROUPS as CURRENT_COMMIT_GROUPS } from './prototypes/current-commit/index.jsx';
import NewShortRunningCommitScreen, { SCREEN_GROUPS as NEW_SHORT_RUNNING_COMMIT_GROUPS } from './prototypes/new-short-running-commit/index.jsx';
import './App.css';

const PROTOTYPES = [
  {
    id: 'current-commit',
    label: 'Current Commit',
    screenGroups: CURRENT_COMMIT_GROUPS,
    component: CurrentCommitScreen,
  },
  {
    id: 'short-running-commit',
    label: 'Current Short-running Commit',
    screenGroups: SHORT_RUNNING_COMMIT_GROUPS,
    component: ShortRunningCommitScreen,
  },
  {
    id: 'new-short-running-commit',
    label: 'New Short-running Commit',
    screenGroups: NEW_SHORT_RUNNING_COMMIT_GROUPS,
    component: NewShortRunningCommitScreen,
  },
  {
    id: 'commit',
    label: 'Commit',
    screenGroups: COMMIT_GROUPS,
    component: CommitScreen,
  },
];

function parseHash() {
  const [prototypeId, screenId] = window.location.hash.slice(1).split('/');
  const prototype = PROTOTYPES.find((p) => p.id === prototypeId) ?? PROTOTYPES[0];
  const allScreens = prototype.screenGroups.flatMap((g) => g.screens);
  const screen = allScreens.find((s) => s.id === screenId) ?? allScreens[0];
  return { prototypeId: prototype.id, screenId: screen?.id };
}

function setHash(prototypeId, screenId) {
  window.location.hash = `${prototypeId}/${screenId}`;
}

export default function App() {
  const [{ prototypeId, screenId }, setRoute] = useState(parseHash);

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Normalize hash on first load if it's missing the screenId
  useEffect(() => {
    const current = window.location.hash.slice(1);
    const expected = `${prototypeId}/${screenId}`;
    if (current !== expected) {
      history.replaceState(null, '', `#${expected}`);
    }
  }, []);

  const activePrototype = PROTOTYPES.find((p) => p.id === prototypeId);
  const allScreens = activePrototype.screenGroups.flatMap((g) => g.screens);
  const activeScreen = allScreens.find((s) => s.id === screenId) ?? allScreens[0];

  const PrototypeComponent = activePrototype.component;

  return (
    <ThemeProvider defaultTheme="dark">
      <main className="prototype-shell">
        <div className="prototype-content">
          <PrototypeComponent
            key={`${prototypeId}::${screenId}`}
            screenId={screenId}
            buttonMode={activeScreen?.buttonMode}
            resolutionMode={activeScreen?.resolutionMode}
            delay={activeScreen?.delay}
          />
        </div>
      </main>
    </ThemeProvider>
  );
}
