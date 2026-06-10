import { useState, useEffect, useRef } from 'react';
import checkmarkIcon from '@jetbrains/int-ui-kit-icons/actions/checked_dark.svg';
import './CommitButtonDemo.css';

const LOADING_DURATION_MS = 3000;
const COMMITED_DURATION_MS = 1000;

export default function AnimatedCommitButton({ onCommitComplete, disabled }) {
  const [state, setState] = useState('idle');
  const timerRef = useRef(null);

  const handleClick = () => {
    if (state !== 'idle' || disabled) return;

    setState('loading');
    timerRef.current = setTimeout(() => {
      setState('commited');
      timerRef.current = setTimeout(() => {
        setState('idle');
        onCommitComplete?.();
      }, COMMITED_DURATION_MS);
    }, LOADING_DURATION_MS);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <button
      className={`commit-btn-animated commit-btn-animated--${state}${disabled && state === 'idle' ? ' commit-btn-animated--default' : ''}`}
      onClick={handleClick}
    >
      {state === 'loading' && <span className="commit-btn-animated__wave" />}
      {state === 'commited' && (
        <img className="commit-btn-animated__icon" src={checkmarkIcon} alt="" />
      )}
      <span className="commit-btn-animated__label">
        {state === 'loading' ? 'Commiting...' : state === 'commited' ? 'Commited' : 'Commit'}
      </span>
    </button>
  );
}
