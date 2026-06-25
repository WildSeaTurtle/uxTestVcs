import checkmarkIcon from '@jetbrains/int-ui-kit-icons/actions/checked_dark.svg';
import './CommitButtonDemo.css';

export function CommitedButton() {
  return (
    <button className="commit-btn-animated commit-btn-animated--commited" disabled>
      <img className="commit-btn-animated__icon" src={checkmarkIcon} alt="" />
      <span className="commit-btn-animated__label">Commited</span>
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
