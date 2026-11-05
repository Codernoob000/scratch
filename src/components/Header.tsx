import React from 'react';
import { content } from '../content/types';

export default function Header(): React.ReactElement {
  return (
    <header className="site-header">
      <div className="page-container">
        <a href="#" className="header-wordmark">
          {content.person.name}
        </a>
        <nav className="header-nav" aria-label="Main Navigation">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          {content.person.links.resume && (
            <a href={content.person.links.resume} target="_blank" rel="noopener noreferrer">
              Résumé
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

