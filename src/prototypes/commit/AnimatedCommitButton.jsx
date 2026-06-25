import { useState, useEffect, useRef } from 'react';
import { Loader } from '@jetbrains/int-ui-kit';
import checkmarkIcon from '@jetbrains/int-ui-kit-icons/actions/checked_dark.svg';
import './CommitButtonDemo.css';

const LOADING_DURATION_MS = 3000;

export function CommitedButton() {
  return (
    <button className="commit-btn-animated commit-btn-animated--commited" disabled>
      <img className="commit-btn-animated__icon" src={checkmarkIcon} alt="" />
      <span className="commit-btn-animated__label">Commited</span>
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

  const isDisabled = loading || (disabled && !loading);

  return (
    <button
      className={`commit-btn-animated${loading ? ' commit-btn-animated--loading' : ''}${isDisabled ? ' button button-secondary button-default text-ui-default button-disabled' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
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
