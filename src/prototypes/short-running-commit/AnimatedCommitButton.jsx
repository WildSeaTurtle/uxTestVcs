import checkmrk2px from '../../../img/checkmrk2px.svg';
import './CommitButtonDemo.css';

export function CommitedButton({ onClick }) {
  return (
    <button className="commit-btn-animated commit-btn-animated--commited" onClick={onClick}>
      <img src={checkmrk2px} width="16" height="16" aria-hidden="true" className="commit-btn-animated__icon" />
    </button>
  );
}

export default function AnimatedCommitButton({ onCommitComplete, disabled }) {
  const handleClick = () => {
    if (disabled) return;
    onCommitComplete?.();
  };

  return (
    <button
      className={`commit-btn-animated${disabled ? ' button button-secondary button-default text-ui-default' : ''}`}
      onClick={handleClick}
    >
      <span className="commit-btn-animated__label">Commit</span>
    </button>
  );
}
