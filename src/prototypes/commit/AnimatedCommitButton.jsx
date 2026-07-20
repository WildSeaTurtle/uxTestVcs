import { useState, useEffect, useRef } from 'react';
import { Loader } from '@jetbrains/int-ui-kit';
import './CommitButtonDemo.css';

const LOADING_DURATION_MS = 3000;

export function CommitedButton({ onClick }) {
  return (
    <button className="commit-btn-animated commit-btn-animated--commited" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="commit-btn-animated__icon">
        <path d="M4 8.5L7 11.5L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export default function AnimatedCommitButton({ onCommitStart, onCommitComplete, disabled }) {
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const handleClick = () => {
    if (loading || disabled) return;

    setLoading(true);
    onCommitStart?.();
    timerRef.current = setTimeout(() => {
      setLoading(false);
      onCommitComplete?.();
    }, LOADING_DURATION_MS);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <button
      className={`commit-btn-animated${loading ? ' commit-btn-animated--loading button button-secondary button-default text-ui-default button-disabled' : disabled ? ' button button-secondary button-default text-ui-default' : ''}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading && (
        <Loader size="small" className="commit-btn-animated__spinner" />
      )}
      <span className="commit-btn-animated__label">
        {loading ? 'Commiting...' : 'Commit'}
      </span>
    </button>
  );
}
