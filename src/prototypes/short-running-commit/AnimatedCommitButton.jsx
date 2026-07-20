import './CommitButtonDemo.css';

export function CommitedButton({ onClick }) {
  return (
    <button className="commit-btn-animated commit-btn-animated--commited" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="commit-btn-animated__icon">
        <path d="M4 8.5L7 11.5L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
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
