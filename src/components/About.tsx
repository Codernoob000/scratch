import React from 'react';
import { content } from '../content/types';

export default function About(): React.ReactElement {
  const { person, about } = content;
  const links = person.links;

  const validLinks: { label: string; href: string }[] = [];
  if (links.github && links.github.trim() !== '') {
    validLinks.push({ label: 'GitHub', href: links.github });
  }
  if (links.linkedin && links.linkedin.trim() !== '') {
    validLinks.push({ label: 'LinkedIn', href: links.linkedin });
  }
  if (links.email && links.email.trim() !== '') {
    const href = links.email === 'TODO' ? 'TODO' : `mailto:${links.email}`;
    validLinks.push({ label: 'Email', href });
  }
  if (links.resume && links.resume.trim() !== '') {
    validLinks.push({ label: 'Résumé', href: links.resume });
  }

  return (
    <section id="about" className="section" aria-labelledby="about-heading">
      <div className="page-container">
        <h2 id="about-heading" className="section-title">
          About
        </h2>
        <div className="about-grid">
          {person.photo && (
            <div className="about-photo-wrapper">
              <img
                src={person.photo}
                alt={person.name}
                className="about-photo"
                width="280"
                height="350"
                loading="lazy"
              />
            </div>
          )}
          <div className="about-content">
            {about.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
            {validLinks.length > 0 && (
              <div className="about-links" aria-label="Personal links">
                {validLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') || item.href.endsWith('.pdf') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') || item.href.endsWith('.pdf') ? 'noopener noreferrer' : undefined}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
