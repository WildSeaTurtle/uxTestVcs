import { useState, useEffect, useRef } from 'react';
import { Loader } from '@jetbrains/int-ui-kit';
import './CommitButtonDemo.css';

const LOADING_DURATION_MS = 3000;

export function CommitedButton({ onClick }) {
  return (
    <button className="commit-btn-v2 commit-btn-v2--commited" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="commit-btn-v2__icon">
        <path d="M2.5 8.25L6 11.75L13.5 4.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="commit-btn-v2__label">Commited</span>
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
      className={`commit-btn-v2${loading ? ' commit-btn-v2--loading button button-secondary button-default text-ui-default button-disabled' : disabled ? ' button button-secondary button-default text-ui-default' : ''}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading && (
        <Loader size="small" className="commit-btn-v2__spinner" />
      )}
      <span className="commit-btn-v2__label">
        {loading ? 'Commiting...' : 'Commit'}
      </span>
    </button>
  );
}
