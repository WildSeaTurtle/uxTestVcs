import './CommitButtonDemo.css';

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

export default function AnimatedCommitButton({ onCommitComplete, disabled }) {
  const handleClick = () => {
    if (disabled) return;
    onCommitComplete?.();
  };

  return (
    <button
      className={`commit-btn-v2${disabled ? ' button button-secondary button-default text-ui-default' : ''}`}
      onClick={handleClick}
    >
      <span className="commit-btn-v2__label">Commit</span>
    </button>
  );
}
