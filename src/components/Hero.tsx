import React from 'react';
import { content } from '../content/types';

export default function Hero(): React.ReactElement {
  return (
    <section className="hero-section" aria-label="Introduction">
      <div className="page-container">
        <h1 className="hero-name">{content.person.name}</h1>
        <p className="hero-line">{content.person.line}</p>
        <div className="hero-hint">
          <svg className="hint-coin" viewBox="0 0 28 28" aria-hidden="true">
            <circle cx="14" cy="14" r="12.5" fill="#B4573A" stroke="#1F1D1A" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="8.5" fill="none" stroke="#1F1D1A" strokeOpacity="0.35" strokeWidth="1" />
            <line x1="14" y1="9" x2="14" y2="19" stroke="#1F1D1A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{content.ticket.hint}</span>
        </div>
        <div className="ticket-placeholder" aria-label="Ticket placeholder">
          Ticket area
        </div>
      </div>
    </section>
  );
}
