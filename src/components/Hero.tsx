import React from 'react';
import { content } from '../content/types';
import Ticket from './ticket/Ticket';

export default function Hero(): React.ReactElement {
  return (
    <section className="hero-section" aria-label="Introduction">
      <div className="page-container">
        <h1 className="hero-name">{content.person.name}</h1>
        <p className="hero-line">{content.person.line}</p>
        <Ticket />
      </div>
    </section>
  );
}
