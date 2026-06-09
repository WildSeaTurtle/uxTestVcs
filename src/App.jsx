import { useState } from 'react';
import { ThemeProvider } from '@jetbrains/int-ui-kit';

import ResolveConflictsScreen, { SCREEN_GROUPS as RESOLVE_CONFLICTS_GROUPS } from './prototypes/resolve-conflicts/index.jsx';
import CommitScreen, { SCREEN_GROUPS as COMMIT_GROUPS } from './prototypes/commit/index.jsx';
import './App.css';

const PROTOTYPES = [
  {
    id: 'resolve-conflicts',
    label: 'Resolve Conflicts',
    screenGroups: RESOLVE_CONFLICTS_GROUPS,
    component: ResolveConflictsScreen,
  },
  {
    id: 'commit',
    label: 'Commit',
    screenGroups: COMMIT_GROUPS,
    component: CommitScreen,
  },
];

const ACTIVE_SCREEN_STORAGE_KEY = 'vcs-prototypes-active-screen';
const ACTIVE_PROTOTYPE_STORAGE_KEY = 'vcs-prototypes-active-prototype';

function getInitialPrototypeId() {
  const stored = window.localStorage.getItem(ACTIVE_PROTOTYPE_STORAGE_KEY);
  return PROTOTYPES.some((p) => p.id === stored) ? stored : PROTOTYPES[0].id;
}

function getInitialScreenId(prototypeId) {
  const prototype = PROTOTYPES.find((p) => p.id === prototypeId);
  const allScreens = prototype.screenGroups.flatMap((g) => g.screens);
  const stored = window.localStorage.getItem(`${ACTIVE_SCREEN_STORAGE_KEY}-${prototypeId}`);
  return allScreens.some((s) => s.id === stored) ? stored : allScreens[0]?.id;
}

export default function App() {
  const [activePrototypeId, setActivePrototypeId] = useState(getInitialPrototypeId);
  const [screenIds, setScreenIds] = useState(() => {
    const result = {};
    for (const p of PROTOTYPES) {
      result[p.id] = getInitialScreenId(p.id);
    }
    return result;
  });
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    const collapsed = new Set();
    for (const p of PROTOTYPES) {
      for (const g of p.screenGroups) {
        if (g.collapsible) collapsed.add(`${p.id}::${g.title}`);
      }
    }
    return collapsed;
  });

  const activePrototype = PROTOTYPES.find((p) => p.id === activePrototypeId);
  const activeScreenId = screenIds[activePrototypeId];
  const allScreens = activePrototype.screenGroups.flatMap((g) => g.screens);
  const activeScreen = allScreens.find((s) => s.id === activeScreenId) ?? allScreens[0];

  const handlePrototypeChange = (prototypeId) => {
    window.localStorage.setItem(ACTIVE_PROTOTYPE_STORAGE_KEY, prototypeId);
    setActivePrototypeId(prototypeId);
  };

  const handleScreenChange = (screenId) => {
    window.localStorage.setItem(`${ACTIVE_SCREEN_STORAGE_KEY}-${activePrototypeId}`, screenId);
    setScreenIds((prev) => ({ ...prev, [activePrototypeId]: screenId }));
  };

  const toggleGroup = (key) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const PrototypeComponent = activePrototype.component;
  const visibleGroups = activePrototype.screenGroups.filter((g) => !g.hidden);
  const visibleScreens = visibleGroups.flatMap((g) => g.screens);
  const hasMultipleScreens = visibleScreens.length > 1;

  return (
    <ThemeProvider defaultTheme="dark">
      <main className="prototype-shell">
        <nav className="screen-switcher" aria-label="Prototype navigation">
          <div className="prototype-picker">
            {PROTOTYPES.map((prototype) => (
              <button
                key={prototype.id}
                type="button"
                className={`prototype-picker-item${prototype.id === activePrototypeId ? ' prototype-picker-item-active' : ''}`}
                onClick={() => handlePrototypeChange(prototype.id)}
              >
                {prototype.label}
              </button>
            ))}
          </div>

          {hasMultipleScreens && (
            <div className="screen-groups">
              {visibleGroups.map((group) => {
                const groupKey = `${activePrototypeId}::${group.title}`;
                const isCollapsed = collapsedGroups.has(groupKey);
                return (
                  <div className="screen-switcher-group" key={group.title}>
                    {group.collapsible ? (
                      <button
                        type="button"
                        className="screen-switcher-group-title screen-switcher-group-title-collapsible"
                        onClick={() => toggleGroup(groupKey)}
                      >
                        <span className={`screen-switcher-group-arrow${isCollapsed ? '' : ' screen-switcher-group-arrow-expanded'}`}>▶</span>
                        {group.title}
                      </button>
                    ) : (
                      <div className="screen-switcher-group-title">{group.title}</div>
                    )}
                    {!isCollapsed && group.screens.map((screen) => (
                      <button
                        key={screen.id}
                        type="button"
                        className={`screen-switcher-tab${screen.id === activeScreenId ? ' screen-switcher-tab-active' : ''}`}
                        role="tab"
                        aria-selected={screen.id === activeScreenId}
                        onClick={() => handleScreenChange(screen.id)}
                      >
                        {screen.label}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

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
