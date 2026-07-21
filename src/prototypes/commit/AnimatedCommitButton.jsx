import { useState, useEffect, useRef } from 'react';
import { Loader } from '@jetbrains/int-ui-kit';
import checkmrk2px from '../../../img/checkmrk2px.svg';
import './CommitButtonDemo.css';

const LOADING_DURATION_MS = 3000;

export function CommitedButton({ onClick }) {
  return (
    <button className="commit-btn-animated commit-btn-animated--commited" onClick={onClick}>
      <img src={checkmrk2px} width="16" height="16" aria-hidden="true" className="commit-btn-animated__icon" />
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
      {loading
        ? <Loader size="small" className="commit-btn-animated__spinner" />
        : <span className="commit-btn-animated__label">Commit</span>
      }
    </button>
  );
}
