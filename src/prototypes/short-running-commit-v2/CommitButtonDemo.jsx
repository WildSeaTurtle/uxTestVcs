import { useState, useEffect, useRef } from 'react';
import { Loader } from '@jetbrains/int-ui-kit';
import './CommitButtonDemo.css';

const LOADING_DURATION_MS = 3000;
const COMMITED_DURATION_MS = 1000;

export default function CommitButtonDemo() {
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'commited'
  const timerRef = useRef(null);

  const handleClick = () => {
    if (state !== 'idle') return;

    setState('loading');
    timerRef.current = setTimeout(() => {
      setState('commited');
      timerRef.current = setTimeout(() => {
        setState('idle');
      }, COMMITED_DURATION_MS);
    }, LOADING_DURATION_MS);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="commit-button-demo-stage">
      <button
        className={`commit-btn-v2 commit-btn-v2--${state}`}
        onClick={handleClick}
        disabled={state === 'loading'}
      >
        {state === 'loading' && (
          <Loader size="small" className="commit-btn-v2__spinner" />
        )}
        {state === 'commited' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="commit-btn-v2__icon">
            <path d="M2.5 8.25L6 11.75L13.5 4.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <span className="commit-btn-v2__label">
          {state === 'loading' ? 'Commiting...' : state === 'commited' ? 'Commited' : 'Commit'}
        </span>
      </button>
    </div>
  );
}
