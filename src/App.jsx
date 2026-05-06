import { useEffect, useState } from 'react';
import { Dialog, Icon, ThemeProvider } from '@jetbrains/int-ui-kit';
import './App.css';

const MIN_WIDTH = 360;
const MIN_HEIGHT = 220;
const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 480;

const conflictGroup = {
  title: 'Unresolved',
  items: [
    {
      id: 'selfreview-core',
      name: 'selfreview-core.html',
      leftStatus: 'Modified',
      rightStatus: 'Modified',
    },
    {
      id: 'slow-module',
      name: 'slow.kotlin_module',
      leftStatus: 'Modified',
      rightStatus: 'Modified',
    },
    {
      id: 'project-default',
      name: 'ProjectDefault.html',
      leftStatus: 'Modified',
      rightStatus: 'Modified',
    },
  ],
};

function ConflictsTable() {
  return (
    <div className="conflicts-table">
      <div className="conflicts-table-header">
        <div className="conflicts-table-header-cell" />
        <div className="conflicts-table-header-cell">feature-auto-feedback</div>
        <div className="conflicts-table-header-cell">origin/feature-auto-feedback</div>
      </div>

      <div className="conflicts-table-body">
        <div className="conflicts-group-row">
          <div className="conflicts-tree-cell">
            <button className="conflicts-disclosure" type="button" aria-label="Collapse group">
              <Icon name="general/chevronDown" size={16} />
            </button>
            <span className="conflicts-group-icon">
              <Icon name="debugger/evaluationResult" size={14} />
            </span>
            <span className="conflicts-group-name">{conflictGroup.title}</span>
          </div>
          <div className="conflicts-status-cell" />
          <div className="conflicts-status-cell" />
        </div>

        {conflictGroup.items.map((item) => (
          <div className="conflicts-file-row" key={item.id}>
            <div className="conflicts-tree-cell conflicts-tree-cell-file">
              <span className="conflicts-tree-indent" />
              <span className="conflicts-file-name">{item.name}</span>
            </div>
            <div className="conflicts-status-cell">{item.leftStatus}</div>
            <div className="conflicts-status-cell">{item.rightStatus}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResizableDialog() {
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [position, setPosition] = useState(() => {
    const left = Math.max(32, Math.round((window.innerWidth - DEFAULT_WIDTH) / 2));
    const top = Math.max(32, Math.round((window.innerHeight - DEFAULT_HEIGHT) / 2));

    return { left, top };
  });
  const [resizeState, setResizeState] = useState(null);

  useEffect(() => {
    if (!resizeState) return undefined;

    const handleResizeMove = (event) => {
      const nextWidth = Math.max(MIN_WIDTH, resizeState.startWidth + (event.clientX - resizeState.startX));
      const nextHeight = Math.max(MIN_HEIGHT, resizeState.startHeight + (event.clientY - resizeState.startY));

      setSize({
        width: nextWidth,
        height: nextHeight,
      });
    };

    const handleResizeEnd = () => {
      setResizeState(null);
    };

    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', handleResizeEnd);

    return () => {
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeEnd);
    };
  }, [resizeState]);

  const handleResizeStart = (event) => {
    event.preventDefault();

    setResizeState({
      startX: event.clientX,
      startY: event.clientY,
      startWidth: size.width,
      startHeight: size.height,
    });
  };

  return (
    <div
      className="dialog-resize-shell"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      <Dialog
        title="Conflicts"
        width="100%"
        height="100%"
        showHelp={false}
        buttons={[
          { children: 'Cancel', type: 'secondary' },
          { children: 'OK', type: 'primary' },
        ]}
        className="empty-dialog"
      >
        <div className="empty-dialog-content">
          <ConflictsTable />
        </div>
      </Dialog>

      <div
        className="dialog-resize-handle"
        onPointerDown={handleResizeStart}
        role="presentation"
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <main className="dialog-demo-screen">
        <ResizableDialog />
      </main>
    </ThemeProvider>
  );
}
