import React from 'react';
import { Project } from '../../content/types';

interface PanelProps {
  project: Project;
  isRevealed: boolean;
  isLocked: boolean;
  lockProgressText: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onReveal: (id: string) => void;
}

export default function Panel({
  project,
  isRevealed,
  isLocked,
  lockProgressText,
  isSelected,
  onSelect,
  onReveal,
}: PanelProps): React.ReactElement {
  const isGolden = Boolean(project.golden);

  const handleClick = () => {
    if (isLocked) return;
    if (!isRevealed) {
      onReveal(project.id);
      onSelect(project.id);
    } else {
      onSelect(project.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Determine panel classes
  const classes = [
    'ticket-panel',
    isGolden ? 'golden' : '',
    isLocked ? 'locked' : '',
    isRevealed ? 'revealed' : 'unrevealed',
    isSelected ? 'selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = isLocked
    ? `Golden panel: ${lockProgressText}`
    : isRevealed
    ? `${project.code}: ${project.title}. Revealed. Press to open details.`
    : isGolden
    ? `Golden panel unlocked. Press to reveal.`
    : `Panel ${project.code}: Press to reveal.`;

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isLocked}
      aria-disabled={isLocked}
      aria-label={ariaLabel}
    >
      {/* Content layer visible when revealed */}
      <div className="panel-content" aria-hidden={!isRevealed}>
        <div className="panel-top-row">
          <span className="panel-code">{project.code}</span>
          {project.event && <span className="panel-event">{project.event}</span>}
        </div>
        <div className="panel-title">{project.title}</div>
      </div>

      {/* Temporary visual cover for unrevealed panels in Phase 2 */}
      {!isRevealed && (
        <div className="panel-cover" aria-hidden="true">
          {isLocked ? (
            <span className="panel-lock-label">{lockProgressText}</span>
          ) : isGolden ? (
            <span className="panel-lock-label unlocked">unlocked</span>
          ) : (
            <span className="panel-cover-code">{project.code}</span>
          )}
        </div>
      )}
    </button>
  );
}
