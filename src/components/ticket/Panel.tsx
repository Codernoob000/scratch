import React from 'react';
import { Project } from '../../content/types';
import { useScratch } from './useScratch';

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

  const canvasRef = useScratch({
    project,
    isRevealed,
    isLocked,
    onReveal: (id) => {
      onReveal(id);
      onSelect(id);
    },
  });

  const handleClick = () => {
    if (isLocked) return;
    // When revealed, clicking opens/reopens the stub
    if (isRevealed) {
      onSelect(project.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isLocked) return;
      if (!isRevealed) {
        onReveal(project.id);
        onSelect(project.id);
      } else {
        onSelect(project.id);
      }
    }
  };

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
    ? `Golden panel unlocked. Scratch to reveal.`
    : `Panel ${project.code}: Scratch or press Enter to reveal.`;

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
      {/* Content layer */}
      <div className="panel-content" aria-hidden={!isRevealed}>
        <div className="panel-top-row">
          <span className="panel-code">{project.code}</span>
        </div>
        <div className="panel-title">{project.title}</div>
      </div>

      {/* Locked overlay for golden panel */}
      {isLocked && (
        <div className="panel-lock-cover" aria-hidden="true">
          <span className="panel-lock-label">{lockProgressText}</span>
        </div>
      )}

      {/* Scratch foil canvas: only present when unlocked and not revealed */}
      {!isRevealed && !isLocked && (
        <canvas
          ref={canvasRef}
          className="scratch-canvas"
          style={{ touchAction: 'none' }}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
