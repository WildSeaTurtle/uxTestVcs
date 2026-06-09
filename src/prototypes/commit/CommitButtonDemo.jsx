import { useState, useEffect, useRef } from 'react';
import checkmarkIcon from '@jetbrains/int-ui-kit-icons/actions/checked_dark.svg';
import './CommitButtonDemo.css';

const LOADING_DURATION_MS = 3000;
const COMMITED_DURATION_MS = 600;

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
        className={`commit-btn-animated commit-btn-animated--${state}`}
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
    </div>
  );
}
