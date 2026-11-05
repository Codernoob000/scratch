import React from 'react';

interface HintProps {
  revealedCount: number;
  totalCount: number;
  hintText: string;
}

export default function Hint({
  revealedCount,
  totalCount,
  hintText,
}: HintProps): React.ReactElement {
  const isInitial = revealedCount === 0;

  return (
    <div
      className={`hero-hint${isInitial ? ' pulsing' : ''}`}
      aria-label="Ticket progress hint"
    >
      <svg className="hint-coin" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="12.5" fill="#B4573A" stroke="#1F1D1A" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="8.5" fill="none" stroke="#1F1D1A" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="14" y1="9" x2="14" y2="19" stroke="#1F1D1A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span>
        {isInitial ? hintText : `${revealedCount} of ${totalCount} revealed`}
      </span>
    </div>
  );
}
